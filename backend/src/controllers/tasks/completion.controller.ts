import { Controller, Post, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { TaskCompletionService } from '../services/completion.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompleteTaskDto, ReferralBonusDto } from '../dto/completion.dto';
import { Request } from 'express';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks/completion')
@UseGuards(AuthGuard)
export class TaskCompletionController {
  constructor(
    private readonly completionService: TaskCompletionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Complete a daily task' })
  @ApiResponse({ status: 201, description: 'Task completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid task or already completed' })
  async completeTask(@Body() completeTaskDto: CompleteTaskDto, @Req() req: Request) {
    try {
      const userId = req.user.userId;
      const ipAddress = req.ip;
      
      const result = await this.completionService.completeUserTask(
        userId,
        completeTaskDto.taskId,
        ipAddress
      );
      
      return {
        success: true,
        data: result,
        message: 'Task completed successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('referral/bonus')
  @ApiOperation({ summary: 'Calculate referral bonuses (internal)' })
  @ApiResponse({ status: 201, description: 'Bonuses calculated' })
  async calculateReferralBonuses(@Body() bonusData: ReferralBonusDto) {
    return this.completionService.calculateReferralBonuses(
      bonusData.userId,
      bonusData.amount,
      bonusData.source
    );
  }
}