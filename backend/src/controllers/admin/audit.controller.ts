import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { HighLevelAdminGuard } from '../guards/high-level.guard';
import { AuditService } from '../../services/audit.service';

@Controller('admin/audit')
@UseGuards(AdminGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(HighLevelAdminGuard)
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('actionType') actionType?: string,
    @Query('adminId') adminId?: number,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const { logs, total } = await this.auditService.getLogs({
      page,
      limit,
      actionType,
      adminId,
      userId,
      startDate,
      endDate
    });

    return {
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        actionTypes: await this.auditService.getActionTypes()
      }
    };
  }

  @Get('actions')
  @UseGuards(HighLevelAdminGuard)
  async getActionTypes() {
    const types = await this.auditService.getActionTypes();
    return {
      success: true,
      data: types
    };
  }

  @Get('suspensions')
  @UseGuards(HighLevelAdminGuard)
  async getSuspensionRecords(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    const { records, total } = await this.auditService.getSuspensionRecords({
      status,
      page,
      limit
    });

    return {
      success: true,
      data: records,
      meta: {
        total,
        page,
        limit,
        statuses: ['active', 'appealed', 'reversed', 'expired']
      }
    };
  }
}