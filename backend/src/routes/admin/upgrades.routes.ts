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
import { UpgradeService } from '../../services/admin/upgrade.service';
import { 
  ApproveUpgradeDto,
  RejectUpgradeDto
} from '../../dto/admin/upgrade.dto';
import { Request } from 'express';
import { RoundRobinService } from '../../services/core/round-robin.service';

@Controller('hidden-admin/upgrades')
@UseGuards(HiddenAdminGuard)
export class UpgradeRoutes {
  constructor(
    private readonly upgradeService: UpgradeService,
    private readonly roundRobin: RoundRobinService
  ) {}

  @Get()
  async getUpgradeRequests(
    @Query('status') status: 'pending' | 'approved' | 'rejected',
    @Req() req: any
  ) {
    return this.roundRobin.distributeRequests(
      'upgrade',
      req.user.admin_id
    );
  }

  @Post('approve')
  async approveUpgrade(
    @Body() data: ApproveUpgradeDto,
    @Req() req: any
  ) {
    return this.upgradeService.processUpgrade(
      data.request_id,
      req.user.admin_id,
      data.admin_notes
    );
  }

  @Post('reject')
  async rejectUpgrade(
    @Body() data: RejectUpgradeDto,
    @Req() req: any
  ) {
    return this.upgradeService.rejectUpgrade(
      data.request_id,
      req.user.admin_id,
      data.reason
    );
  }

  @Get('vip-metrics')
  async getVipUpgradeMetrics() {
    return this.upgradeService.getVipLevelUpgradeStats();
  }
}