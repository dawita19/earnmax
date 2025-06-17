import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DailyTasksService } from '../services/daily.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DailyTaskDto, ResetTasksDto } from '../dto/daily-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks/daily')
@UseGuards(AuthGuard)
export class DailyTasksController {
  constructor(private readonly dailyTasksService: DailyTasksService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get daily tasks for user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getDailyTasks(@Param('userId') userId: string) {
    return this.dailyTasksService.getUserDailyTasks(userId);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset daily tasks (admin only)' })
  @ApiResponse({ status: 201, description: 'Tasks reset successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async resetDailyTasks(@Body() resetData: ResetTasksDto, @Req() req) {
    // Verify admin privileges from request
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.dailyTasksService.resetAllDailyTasks(resetData.date);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate tasks for new VIP level' })
  @ApiResponse({ status: 201, description: 'Tasks generated successfully' })
  async generateVipTasks(@Body() taskData: DailyTaskDto) {
    return this.dailyTasksService.generateVipLevelTasks(taskData.vipLevel);
  }
}