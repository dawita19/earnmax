import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SecurityService } from '../services/security.service';
import { EnableTwoFactorDto } from '../dto/enable-two-factor.dto';
import { VerifyTwoFactorDto } from '../dto/verify-two-factor.dto';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';

@ApiTags('User Security')
@ApiBearerAuth()
@Controller('user/security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('enable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 201, description: '2FA setup initiated' })
  async enableTwoFactor(
    @Req() req: RequestWithUser,
    @Body() enableTwoFactorDto: EnableTwoFactorDto
  ) {
    return this.securityService.enableTwoFactor(req.user.userId, enableTwoFactorDto);
  }

  @Post('verify-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify two-factor authentication setup' })
  @ApiResponse({ status: 200, description: '2FA verified and enabled' })
  async verifyTwoFactor(
    @Req() req: RequestWithUser,
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto
  ) {
    return this.securityService.verifyTwoFactor(req.user.userId, verifyTwoFactorDto);
  }

  @Post('payment-method')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update payment method for withdrawals' })
  @ApiResponse({ status: 200, description: 'Payment method updated' })
  async updatePaymentMethod(
    @Req() req: RequestWithUser,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto
  ) {
    return this.securityService.updatePaymentMethod(
      req.user.userId,
      updatePaymentMethodDto
    );
  }

  @Get('login-history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user login history' })
  @ApiResponse({ status: 200, description: 'Login history retrieved' })
  async getLoginHistory(@Req() req: RequestWithUser) {
    return this.securityService.getLoginHistory(req.user.userId);
  }
}