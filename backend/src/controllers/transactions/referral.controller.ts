import { Controller, Get, Post, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../types/request-with-user.interface';
import { ReferralService } from '../services/referral.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Referral System')
@Controller('transactions/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('network')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user referral network' })
  async getReferralNetwork(@Req() request: RequestWithUser) {
    try {
      const { user } = request;
      const network = await this.referralService.getUserNetwork(user.userId);

      return {
        status: 'success',
        data: network,
        message: 'Referral network retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Failed to retrieve referral network',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get referral statistics' })
  async getReferralStats(@Req() request: RequestWithUser) {
    try {
      const { user } = request;
      const stats = await this.referralService.getUserReferralStats(user.userId);

      return {
        status: 'success',
        data: stats,
        message: 'Referral stats retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Failed to retrieve referral stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('calculate-bonus')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Calculate weekly referral bonus' })
  async calculateWeeklyBonus(@Req() request: RequestWithUser) {
    try {
      const { user } = request;
      const result = await this.referralService.calculateWeeklyBonus(user.userId);

      if (result.bonusAmount > 0) {
        return {
          status: 'success',
          data: result,
          message: `Weekly bonus of ${result.bonusAmount} calculated and credited`
        };
      }

      return {
        status: 'success',
        data: result,
        message: 'No bonus qualified this week'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Failed to calculate weekly bonus',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('invitation-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user invitation information' })
  async getInvitationInfo(@Req() request: RequestWithUser) {
    try {
      const { user } = request;
      const invitationInfo = await this.referralService.getInvitationInfo(user.userId);

      return {
        status: 'success',
        data: invitationInfo,
        message: 'Invitation information retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Failed to retrieve invitation info',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}