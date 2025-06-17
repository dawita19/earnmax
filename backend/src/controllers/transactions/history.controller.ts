import { Controller, Get, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../types/request-with-user.interface';
import { HistoryService } from '../services/history.service';
import { TransactionType } from '../enums/transaction-type.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Transaction History')
@Controller('transactions/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transaction history with filters' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  async getTransactionHistory(
    @Req() request: RequestWithUser,
    @Query() query: {
      type?: TransactionType;
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    }
  ) {
    try {
      const { user } = request;
      const { type, startDate, endDate, limit = 10, page = 1 } = query;

      const history = await this.historyService.getUserHistory({
        userId: user.userId,
        transactionType: type,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: Number(limit),
        page: Number(page)
      });

      return {
        status: 'success',
        data: history,
        message: 'Transaction history retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Failed to retrieve transaction history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('referral')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get referral bonus history' })
  async getReferralHistory(
    @Req() request: RequestWithUser,
    @Query() query: { level?: number; limit?: number; page?: number }
  ) {
    try {
      const { user } = request;
      const { level, limit = 10, page = 1 } = query;

      const referralHistory = await this.historyService.getReferralHistory({
        userId: user.userId,
        level: level ? Number(level) : undefined,
        limit: Number(limit),
        page: Number(page)
      });

      return {
        status: 'success',
        data: referralHistory,
        message: 'Referral history retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Failed to retrieve referral history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}