import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { LoginDto } from '../dto/login.dto';
import * as argon2 from 'argon2';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
  ) {}

  async validateUser(phoneOrEmail: string, password: string) {
    const user = await this.usersService.findByPhoneOrEmail(phoneOrEmail);
    if (user && await argon2.verify(user.password_hash, password)) {
      if (user.is_locked) {
        throw new Error('Account is locked');
      }
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.phoneOrEmail, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const payload = { 
      sub: user.user_id,
      phone: user.phone_number,
      vip: user.vip_level,
      role: 'user'
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async adminLogin(username: string, password: string) {
    const admin = await this.adminService.findByUsername(username);
    if (!admin || !await argon2.verify(admin.password_hash, password)) {
      throw new Error('Invalid admin credentials');
    }
    
    const payload = {
      sub: admin.admin_id,
      username: admin.username,
      level: admin.admin_level,
      role: 'admin'
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}