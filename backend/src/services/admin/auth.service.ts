import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Admin } from '../../entities/admin.entity';
import { AuditLogService } from '../shared/audit-log.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auditLog: AuditLogService
  ) {}

  async validateAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin || !admin.is_active) return null;
    
    if (admin.login_attempts >= 5 && admin.is_locked) {
      await this.auditLog.logAction(null, 'ADMIN_LOCKED_ATTEMPT', `Locked admin ${username} attempted login`);
      return null;
    }

    const valid = await argon2.verify(admin.password_hash, password);
    
    if (!valid) {
      admin.login_attempts += 1;
      if (admin.login_attempts >= 5) admin.is_locked = true;
      await admin.save();
      return null;
    }

    // Reset attempts on successful login
    admin.login_attempts = 0;
    admin.last_login = new Date();
    await admin.save();

    return admin;
  }

  async login(admin: Admin, ip: string, userAgent: string) {
    const payload = { 
      username: admin.username, 
      sub: admin.admin_id,
      level: admin.admin_level,
      permissions: admin.permissions
    };

    await this.auditLog.logAction(
      admin.admin_id, 
      'ADMIN_LOGIN', 
      `Admin ${admin.username} logged in`,
      ip,
      userAgent
    );

    return {
      access_token: this.jwtService.sign(payload),
      requires_2fa: admin.two_factor_enabled
    };
  }

  async generate2FASecret(admin: Admin) {
    // Implementation for 2FA secret generation
    // ...
  }
}