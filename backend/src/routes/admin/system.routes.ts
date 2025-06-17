import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards,
  Patch
} from '@nestjs/common';
import { HighLevelAdminGuard } from '../../guards/high-level-admin.guard';
import { SystemService } from '../../services/admin/system.service';
import { 
  UpdateVipLevelDto,
  SystemSettingsDto
} from '../../dto/admin/system.dto';
import { HiddenAdminGuard } from '../../guards/hidden-admin.guard';

@Controller('hidden-admin/system')
@UseGuards(HiddenAdminGuard)
export class SystemRoutes {
  constructor(private readonly systemService: SystemService) {}

  @UseGuards(HighLevelAdminGuard)
  @Get('statistics')
  async getSystemStatistics() {
    return this.systemService.getSystemStats();
  }

  @UseGuards(HighLevelAdminGuard)
  @Patch('vip-levels')
  async updateVipLevel(@Body() data: UpdateVipLevelDto) {
    return this.systemService.updateVipLevel(
      data.level,
      data.updateData
    );
  }

  @UseGuards(HighLevelAdminGuard)
  @Get('suspensions')
  async getSuspensionRecords() {
    return this.systemService.getActiveSuspensions();
  }

  @UseGuards(HighLevelAdminGuard)
  @Post('settings')
  async updateSystemSettings(@Body() data: SystemSettingsDto) {
    return this.systemService.updateSystemSettings(data);
  }

  @UseGuards(HighLevelAdminGuard)
  @Get('audit-logs')
  async getAuditLogs() {
    return this.systemService.getRecentAuditLogs();
  }
}