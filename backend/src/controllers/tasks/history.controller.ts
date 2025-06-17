import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { TaskHistoryService } from '../services/history.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto, TaskHistoryDto } from '../dto/history.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks/history')
@UseGuards(AuthGuard)
export class TaskHistoryController {
  constructor(private readonly historyService: TaskHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get task completion history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  async getTaskHistory(
    @Req() req,
    @Query() pagination: PaginationDto
  ): Promise<TaskHistoryDto[]> {
    return this.historyService.getUserTaskHistory(
      req.user.userId,
      pagination.page,
      pagination.limit
    );
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get earnings history from tasks' })
  @ApiResponse({ status: 200, description: 'Earnings history retrieved' })
  async getEarningsHistory(
    @Req() req,
    @Query() pagination: PaginationDto
  ) {
    return this.historyService.getUserEarningsHistory(
      req.user.userId,
      pagination.page,
      pagination.limit
    );
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Get referral earnings history' })
  @ApiResponse({ status: 200, description: 'Referral history retrieved' })
  async getReferralHistory(
    @Req() req,
    @Query() pagination: PaginationDto
  ) {
    return this.historyService.getUserReferralHistory(
      req.user.userId,
      pagination.page,
      pagination.limit
    );
  }
}