import { Controller, Get, Headers, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AdminDashboardService } from '../../../services/admin/dashboard.service';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { AuditLogService } from '../../../services/audit-log.service';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly dashboardService: AdminDashboardService,
    private readonly auditLog: AuditLogService
  ) {}

  @Get('metrics')
  @AdminAuthGuard('high') // Only high-level admins can access
  async getDashboardMetrics(@Res() res: Response, @Headers('authorization') authHeader: string) {
    try {
      const metrics = await this.dashboardService.getRealTimeMetrics();
      
      // Log dashboard access
      const token = authHeader.split(' ')[1];
      await this.auditLog.logDashboardAccess(token, 'metrics');

      return res.status(HttpStatus.OK).json({
        message: 'Welcome Boss',
        metrics
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to load dashboard metrics'
      });
    }
  }

  @Get('vip-distribution')
  @AdminAuthGuard() // Both high and low level admins can access
  async getVipDistribution(@Res() res: Response) {
    try {
      const distribution = await this.dashboardService.getVipLevelDistribution();
      
      return res.status(HttpStatus.OK).json({
        vipDistribution: distribution
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to load VIP distribution'
      });
    }
  }

  @Get('pending-requests')
  @AdminAuthGuard()
  async getPendingRequests(@Res() res: Response) {
    try {
      const requests = await this.dashboardService.getPendingRequestsCount();
      
      return res.status(HttpStatus.OK).json({
        pendingRequests: requests
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to load pending requests'
      });
    }
  }
}