import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Query,
  Req
} from '@nestjs/common';
import { HiddenAdminGuard } from '../../guards/hidden-admin.guard';
import { WithdrawalService } from '../../services/admin/withdrawal.service';
import { 
  ApproveWithdrawalDto,
  RejectWithdrawalDto
} from '../../dto/admin/withdrawal.dto';
import { Request } from 'express';
import { RoundRobinService } from '../../services/core/round-robin.service';

@Controller('hidden-admin/withdrawals')
@UseGuards(HiddenAdminGuard)
export class WithdrawalRoutes {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly roundRobin: RoundRobinService
  ) {}

  @Get()
  async getWithdrawalRequests(
    @Query('status') status: 'pending' | 'approved' | 'rejected',
    @Req() req: any
  ) {
    return this.roundRobin.distributeRequests(
      'withdrawal',
      req.user.admin_id
    );
  }

  @Post('approve')
  async approveWithdrawal(
    @Body() data: ApproveWithdrawalDto,
    @Req() req: any
  ) {
    return this.withdrawalService.approveWithdrawal(
      data.request_id,
      req.user.admin_id,
      data.transaction_id
    );
  }

  @Post('reject')
  async rejectWithdrawal(
    @Body() data: RejectWithdrawalDto,
    @Req() req: any
  ) {
    return this.withdrawalService.rejectWithdrawal(
      data.request_id,
      req.user.admin_id,
      data.reason
    );
  }

  @Get('metrics')
  async getWithdrawalMetrics() {
    return {
      totalAmount: await this.withdrawalService.getTotalWithdrawalAmount(),
      pendingAmount: await this.withdrawalService.getPendingWithdrawalAmount(),
      todayApproved: await this.withdrawalService.getTodayApprovedWithdrawals()
    };
  }
}