import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Query,
  Patch
} from '@nestjs/common';
import { HiddenAdminGuard } from '../../guards/hidden-admin.guard';
import { UserAdminService } from '../../services/admin/user.service';
import { 
  SuspendUserDto,
  UpdateUserVipDto,
  SearchUsersDto
} from '../../dto/admin/user.dto';
import { HighLevelAdminGuard } from '../../guards/high-level-admin.guard';

@Controller('hidden-admin/users')
@UseGuards(HiddenAdminGuard)
export class UserRoutes {
  constructor(private readonly userService: UserAdminService) {}

  @Get()
  async searchUsers(@Query() query: SearchUsersDto) {
    return this.userService.searchUsers(query);
  }

  @Get(':id')
  async getUserDetails(@Param('id') userId: string) {
    return this.userService.getUserWithStats(parseInt(userId));
  }

  @UseGuards(HighLevelAdminGuard)
  @Post('suspend')
  async suspendUser(@Body() data: SuspendUserDto) {
    return this.userService.suspendUser(
      data.user_id,
      data.reason,
      data.duration_days
    );
  }

  @UseGuards(HighLevelAdminGuard)
  @Patch('vip-level')
  async updateUserVip(@Body() data: UpdateUserVipDto) {
    return this.userService.manualVipAdjustment(
      data.user_id,
      data.new_level,
      data.amount,
      data.reason
    );
  }

  @Get('loan/:userId')
  async getUserLoanInfo(@Param('userId') userId: string) {
    return this.userService.getUserLoanDetails(parseInt(userId));
  }
}