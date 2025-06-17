import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AdminAuthService } from '../../services/admin/auth.service';
import { HiddenAdminGuard } from '../../guards/hidden-admin.guard';
import { AdminLoginDto } from '../../dto/admin/auth.dto';
import { Request, Response } from 'express';
import { AuditLogService } from '../../services/admin/audit-log.service';

@Controller('hidden-admin/auth')
export class AdminAuthRoutes {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly auditLog: AuditLogService
  ) {}

  @Post('login')
  async login(
    @Body() credentials: AdminLoginDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const { admin, token } = await this.authService.validateAdmin(credentials);
      
      // Set secure HTTP-only cookie
      res.cookie('admin_jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      await this.auditLog.logAccess(admin.admin_id, req.ip, 'Login');
      
      return res.status(200).json({
        message: 'Welcome boss',
        admin: {
          id: admin.admin_id,
          username: admin.username,
          level: admin.admin_level
        },
        animatedWelcome: true
      });
    } catch (error) {
      await this.auditLog.logFailedAttempt(req.ip, credentials.username);
      throw error;
    }
  }

  @UseGuards(HiddenAdminGuard)
  @Post('logout')
  async logout(@Res() res: Response, @Req() req: any) {
    await this.auditLog.logAccess(req.user.admin_id, req.ip, 'Logout');
    res.clearCookie('admin_jwt');
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  @UseGuards(HiddenAdminGuard)
  @Post('2fa/setup')
  async setupTwoFactor(@Req() req: any) {
    return this.authService.setupTwoFactor(req.user.admin_id);
  }
}