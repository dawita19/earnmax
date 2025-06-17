import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { HiddenAdminGuard } from '../../guards/hidden-admin.guard';
import { AdminDashboardService } from '../../services/admin/dashboard.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('hidden-admin/dashboard')
@UseGuards(HiddenAdminGuard)
export class AdminDashboardRoutes {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('metrics')
  async getRealTimeMetrics(@Req() req: Request) {
    const metrics = await this.dashboardService.getAdminMetrics();
    return {
      ...metrics,
      animatedWelcome: req.cookies?.firstLogin ? true : false
    };
  }

  @Get('vip-distribution')
  async getVipDistribution() {
    return this.dashboardService.getVipLevelDistribution();
  }

  @Get('request-queues')
  async getRequestQueues() {
    return {
      purchases: await this.dashboardService.getPurchaseQueue(),
      upgrades: await this.dashboardService.getUpgradeQueue(),
      withdrawals: await this.dashboardService.getWithdrawalQueue()
    };
  }
}