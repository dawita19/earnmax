import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VipLevelsService } from '../services/vip-levels.service';
import { VipLevelDto } from '../dto/vip-level.dto';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';

@ApiTags('VIP Levels')
@Controller('vip/levels')
export class VipLevelsController {
  constructor(private readonly vipLevelsService: VipLevelsService) {}

  @Get()
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all VIP levels' })
  @ApiResponse({ status: 200, description: 'VIP levels retrieved successfully', type: [VipLevelDto] })
  async getAllLevels(): Promise<VipLevelDto[]> {
    return this.vipLevelsService.getAllLevels();
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get VIP level details (Admin only)' })
  @ApiResponse({ status: 200, description: 'VIP level details', type: VipLevelDto })
  async getLevelDetails(@Param('id') levelId: number): Promise<VipLevelDto> {
    return this.vipLevelsService.getLevelDetails(levelId);
  }
}