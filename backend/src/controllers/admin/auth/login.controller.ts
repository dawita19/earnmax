import { Controller, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AdminAuthService } from '../../../services/admin/auth.service';
import { HiddenAdminLoginDto } from '../../../dto/admin/auth/login.dto';
import { AuditLogService } from '../../../services/audit-log.service';

@Controller('admin/auth')
export class AdminLoginController {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly auditLog: AuditLogService
  ) {}

  @Post('login')
  async login(
    @Body() credentials: HiddenAdminLoginDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      // IP Whitelist check
      const ip = req.ip;
      if (!this.authService.isIpWhitelisted(ip)) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'Access denied from this IP address'
        });
      }

      // Validate credentials
      const admin = await this.authService.validateAdmin(
        credentials.username,
        credentials.password
      );

      if (!admin) {
        await this.auditLog.logAccessAttempt(
          credentials.username,
          ip,
          'Failed login - invalid credentials'
        );
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid credentials'
        });
      }

      // Check if admin is active
      if (!admin.is_active) {
        await this.auditLog.logAccessAttempt(
          credentials.username,
          ip,
          'Failed login - account inactive'
        );
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'Account is disabled'
        });
      }

      // Generate JWT token
      const token = await this.authService.generateAdminToken(admin);

      await this.auditLog.logAccessAttempt(
        credentials.username,
        ip,
        'Successful login'
      );

      return res.status(HttpStatus.OK).json({
        message: 'Welcome Boss',
        token,
        requires2FA: admin.two_factor_enabled
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred during login'
      });
    }
  }
}