import { Controller, Post, Body, Headers, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Admin2FADto } from '../../../dto/admin/auth/2fa.dto';
import { AdminAuthService } from '../../../services/admin/auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('admin/auth/2fa')
export class Admin2FAController {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('verify')
  async verify2FA(
    @Body() twoFAData: Admin2FADto,
    @Headers('authorization') authHeader: string,
    @Res() res: Response
  ) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = this.jwtService.decode(token);

      if (!decoded || !decoded.username) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid token'
        });
      }

      const isValid = await this.authService.verify2FACode(
        decoded.username,
        twoFAData.code
      );

      if (!isValid) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid 2FA code'
        });
      }

      // Generate new token with 2FA verified flag
      const newToken = await this.authService.generateAdminToken({
        ...decoded,
        is2FAVerified: true
      });

      return res.status(HttpStatus.OK).json({
        message: '2FA verification successful',
        token: newToken
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: '2FA verification failed'
      });
    }
  }

  @Post('setup')
  async setup2FA(@Headers('authorization') authHeader: string, @Res() res: Response) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = this.jwtService.decode(token);

      if (!decoded || !decoded.adminId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid token'
        });
      }

      const { secret, qrCodeUrl } = await this.authService.setup2FA(decoded.adminId);

      return res.status(HttpStatus.OK).json({
        message: '2FA setup initiated',
        secret,
        qrCodeUrl
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: '2FA setup failed'
      });
    }
  }
}