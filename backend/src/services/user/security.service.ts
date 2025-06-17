import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginAttempt } from '../../entities/login-attempt.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditLogService } from '../system/audit-log.service';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async validateUser(identifier: string, password: string, ipAddress: string) {
    const user = await this.userRepository.findOne({
      where: [{ phone_number: identifier }, { email: identifier }],
      select: ['user_id', 'phone_number', 'email', 'password_hash', 'account_status', 'is_locked', 'login_attempts'],
    });

    if (!user) {
      await this.recordFailedAttempt(null, identifier, ipAddress);
      return null;
    }

    if (user.account_status !== 'active' || user.is_locked) {
      await this.recordFailedAttempt(user.user_id, identifier, ipAddress);
      throw new Error('Account is locked or inactive');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await this.recordFailedAttempt(user.user_id, identifier, ipAddress);
      
      // Lock account after 5 failed attempts
      if (user.login_attempts >= 4) {
        await this.userRepository.update(user.user_id, {
          is_locked: true,
          login_attempts: user.login_attempts + 1,
        });
        throw new Error('Account locked due to too many failed attempts');
      }
      
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.userRepository.update(user.user_id, {
      last_login: new Date(),
      login_attempts: 0,
      is_locked: false,
      ip_address: ipAddress,
    });

    await this.auditLogService.log(
      null,
      user.user_id,
      'login_success',
      'User logged in successfully',
      ipAddress,
    );

    return user;
  }

  async recordFailedAttempt(userId: number | null, identifier: string, ipAddress: string) {
    await this.loginAttemptRepository.save({
      user_id: userId,
      identifier,
      ip_address: ipAddress,
      attempt_time: new Date(),
      successful: false,
    });

    if (userId) {
      await this.userRepository.update(userId, {
        login_attempts: () => 'login_attempts + 1',
      });

      await this.auditLogService.log(
        null,
        userId,
        'login_failed',
        'Failed login attempt',
        ipAddress,
      );
    }
  }

  async generateJwtToken(user: User) {
    const payload = {
      sub: user.user_id,
      phone: user.phone_number,
      email: user.email,
      vip: user.vip_level,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d',
      }),
    };
  }

  async unlockAccount(userId: number, adminId?: number) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new Error('User not found');

    await this.userRepository.update(userId, {
      is_locked: false,
      login_attempts: 0,
    });

    await this.auditLogService.log(
      adminId || null,
      userId,
      'account_unlocked',
      adminId ? 'Admin unlocked account' : 'Account unlocked via reset',
      null,
    );

    return { success: true, message: 'Account unlocked successfully' };
  }

  async verifyIpAddress(userId: number, ipAddress: string) {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      select: ['user_id', 'ip_address', 'vip_level'],
    });

    if (!user) return false;

    // VIP users have no IP restrictions
    if (user.vip_level > 0) return true;

    // Free users must use the same IP
    return user.ip_address === ipAddress;
  }
}