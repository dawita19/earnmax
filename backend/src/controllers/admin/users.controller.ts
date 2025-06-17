import { Controller, Get, Post, Body, Param, UseGuards, Query, Put } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { UserService } from '../../services/user.service';
import { AuditService } from '../../services/audit.service';
import { VipService } from '../../services/vip.service';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly vipService: VipService,
    private readonly auditService: AuditService
  ) {}

  @Get()
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('vipLevel') vipLevel?: number,
    @Query('search') search?: string
  ) {
    const { users, total } = await this.userService.getUsers({ page, limit, vipLevel, search });
    
    return {
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        vipDistribution: await this.vipService.getVipDistribution()
      }
    };
  }

  @Get(':id')
  async getUserDetails(@Param('id') id: number) {
    const user = await this.userService.getUserWithStats(id);
    return {
      success: true,
      data: user
    };
  }

  @Post(':id/suspend')
  async suspendUser(
    @Param('id') id: number,
    @Body('adminId') adminId: number,
    @Body('reason') reason: string,
    @Body('durationDays') durationDays: number = 30
  ) {
    const result = await this.userService.suspendUser(id, adminId, reason, durationDays);
    
    await this.auditService.logAction({
      adminId,
      actionType: 'USER_SUSPENSION',
      description: `Suspended user ID: ${id}. Reason: ${reason}`,
      referenceId: id
    });

    return {
      success: true,
      message: 'User suspended successfully',
      data: result
    };
  }

  @Post(':id/unsuspend')
  async unsuspendUser(
    @Param('id') id: number,
    @Body('adminId') adminId: number
  ) {
    const result = await this.userService.unsuspendUser(id);
    
    await this.auditService.logAction({
      adminId,
      actionType: 'USER_UNSUSPENSION',
      description: `Unsuspended user ID: ${id}`,
      referenceId: id
    });

    return {
      success: true,
      message: 'User suspension lifted',
      data: result
    };
  }

  @Get(':id/network')
  async getUserNetwork(
    @Param('id') id: number,
    @Query('level') level: number = 1
  ) {
    const network = await this.userService.getUserNetwork(id, level);
    return {
      success: true,
      data: network
    };
  }
}