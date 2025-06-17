import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { SystemService } from '../../services/system.service';
import { HighLevelAdminGuard } from '../guards/high-level.guard';
import { AuditService } from '../../services/audit.service';

@Controller('admin/system')
@UseGuards(AdminGuard)
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly auditService: AuditService
  ) {}

  @Get('stats')
  @UseGuards(HighLevelAdminGuard)
  async getSystemStats() {
    const stats = await this.systemService.getSystemStatistics();
    return {
      success: true,
      data: stats
    };
  }

  @Post('maintenance')
  @UseGuards(HighLevelAdminGuard)
  async toggleMaintenanceMode(
    @Body('adminId') adminId: number,
    @Body('enabled') enabled: boolean,
    @Body('message') message: string
  ) {
    const result = await this.systemService.setMaintenanceMode(enabled, message);
    
    await this.auditService.logAction({
      adminId,
      actionType: 'MAINTENANCE_MODE',
      description: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      metadata: { message }
    });

    return {
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: result
    };
  }

  @Get('requests/distribution')
  @UseGuards(HighLevelAdminGuard)
  async getRequestDistribution() {
    const distribution = await this.systemService.getRequestDistribution();
    return {
      success: true,
      data: distribution
    };
  }

  @Post('notifications/broadcast')
  @UseGuards(HighLevelAdminGuard)
  async broadcastNotification(
    @Body('adminId') adminId: number,
    @Body('title') title: string,
    @Body('message') message: string,
    @Body('vipLevel') vipLevel?: number
  ) {
    const result = await this.systemService.broadcastNotification(title, message, vipLevel);
    
    await this.auditService.logAction({
      adminId,
      actionType: 'BROADCAST_NOTIFICATION',
      description: `Sent broadcast to ${vipLevel ? `VIP ${vipLevel}+` : 'all users'}`,
      metadata: { title }
    });

    return {
      success: true,
      message: 'Notification broadcasted',
      data: result
    };
  }
}