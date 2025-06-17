import { Controller, Post, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { WithdrawalService } from '../services/withdrawal.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../types/request-with-user.interface';
import { CreateWithdrawalDto } from '../dto/create-withdrawal.dto';
import { AdminApprovalGuard } from '../guards/admin-approval.guard';
import { RoundRobinDistribution } from '../decorators/round-robin.decorator';

@Controller('transactions/withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RoundRobinDistribution('withdrawal') // Custom decorator for round-robin distribution
  async createWithdrawal(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @Req() request: RequestWithUser
  ) {
    try {
      const { user } = request;
      const { amount, paymentPassword } = createWithdrawalDto;

      // Verify payment password
      if (!this.withdrawalService.verifyPaymentPassword(user, paymentPassword)) {
        throw new HttpException('Invalid payment password', HttpStatus.UNAUTHORIZED);
      }

      // Check VIP level and withdrawal limits
      const validation = await this.withdrawalService.validateWithdrawal(user, amount);
      if (!validation.valid) {
        throw new HttpException(validation.message, HttpStatus.BAD_REQUEST);
      }

      // Create withdrawal request
      const withdrawalRequest = await this.withdrawalService.createRequest(
        user,
        amount,
        createWithdrawalDto.paymentMethod,
        createWithdrawalDto.paymentDetails
      );

      return {
        status: 'success',
        data: withdrawalRequest,
        message: 'Withdrawal request submitted for admin approval'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Withdrawal processing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/approve')
  @UseGuards(JwtAuthGuard, AdminApprovalGuard)
  async approveWithdrawal(
    @Body() { requestId, adminNotes }: { requestId: string; adminNotes?: string }
  ) {
    try {
      const result = await this.withdrawalService.processApproval(requestId, adminNotes);
      return {
        status: 'success',
        data: result,
        message: 'Withdrawal approved and processed successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Approval processing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}