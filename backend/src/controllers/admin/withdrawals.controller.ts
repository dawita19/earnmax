import { Controller, Post, Body, Param, UseGuards, Get, Query } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { WithdrawalService } from '../../services/withdrawal.service';
import { RoundRobinGuard } from '../guards/round-robin.guard';
import { AuditService } from '../../services/audit.service';

@Controller('admin/withdrawals')
@UseGuards(AdminGuard)
export class WithdrawalsController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly auditService: AuditService
  ) {}

  @Get()
  @UseGuards(RoundRobinGuard)
  async getPendingWithdrawals(@Query('adminId') adminId: number) {
    const withdrawals = await this.withdrawalService.getPendingRequests(adminId);
    return {
      success: true,
      data: withdrawals,
      metrics: await this.withdrawalService.getWithdrawalMetrics()
    };
  }

  @Post(':id/approve')
  async approveWithdrawal(
    @Param('id') id: number,
    @Body('adminId') adminId: number,
    @Body('notes') notes: string
  ) {
    const result = await this.withdrawalService.approveWithdrawal(id, adminId);
    
    await this.auditService.logAction({
      adminId,
      actionType: 'WITHDRAWAL_APPROVAL',
      description: `Approved withdrawal ID: ${id}`,
      referenceId: id
    });

    return {
      success: true,
      message: 'Withdrawal approved successfully',
      data: result
    };
  }

  @Post(':id/reject')
  async rejectWithdrawal(
    @Param('id') id: number,
    @Body('adminId') adminId: number,
    @Body('reason') reason: string
  ) {
    const result = await this.withdrawalService.rejectWithdrawal(id, adminId, reason);
    
    await this.auditService.logAction({
      adminId,
      actionType: 'WITHDRAWAL_REJECTION',
      description: `Rejected withdrawal ID: ${id}. Reason: ${reason}`,
      referenceId: id
    });

    return {
      success: true,
      message: 'Withdrawal rejected',
      data: result
    };
  }

  @Get('metrics')
  async getWithdrawalMetrics() {
    return {
      success: true,
      data: await this.withdrawalService.getWithdrawalMetrics()
    };
  }
}