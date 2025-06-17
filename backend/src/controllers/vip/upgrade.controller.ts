import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Get,
  Query,
  Param
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { VipUpgradeService } from '../services/vip-upgrade.service';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { CreateUpgradeDto } from '../dto/create-upgrade.dto';
import { UpgradeRequestDto } from '../dto/upgrade-request.dto';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { UpgradeApprovalDto } from '../dto/upgrade-approval.dto';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { RoundRobinService } from '../../distribution/services/round-robin.service';
import { UserBalanceService } from '../../user/services/user-balance.service';

@ApiTags('VIP Upgrade')
@Controller('vip/upgrade')
export class VipUpgradeController {
  constructor(
    private readonly vipUpgradeService: VipUpgradeService,
    private readonly roundRobinService: RoundRobinService,
    private readonly userBalanceService: UserBalanceService
  ) {}

  @Post('check-eligibility')
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check upgrade eligibility and calculate costs' })
  @ApiBody({ type: CreateUpgradeDto })
  @ApiResponse({
    status: 200,
    description: 'Eligibility check result',
    schema: {
      type: 'object',
      properties: {
        eligible: { type: 'boolean' },
        currentLevel: { type: 'number' },
        targetLevel: { type: 'number' },
        amountDifference: { type: 'number' },
        balanceCoverage: { type: 'number' },
        requiredTopup: { type: 'number', nullable: true }
      }
    }
  })
  async checkUpgradeEligibility(
    @Body() createUpgradeDto: CreateUpgradeDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.vipUpgradeService.checkUpgradeEligibility(
      req.user.userId,
      createUpgradeDto.targetLevelId
    );

    if (!result.eligible) {
      throw new BadRequestException(result.reason);
    }

    const userBalance = await this.userBalanceService.getUserBalance(req.user.userId);
    const balanceCoverage = Math.min(userBalance, result.amountDifference);
    const requiredTopup = result.amountDifference > userBalance 
      ? result.amountDifference - userBalance 
      : null;

    return {
      ...result,
      balanceCoverage,
      requiredTopup
    };
  }

  @Post()
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request VIP level upgrade' })
  @ApiBody({ type: CreateUpgradeDto })
  @ApiResponse({
    status: 201,
    description: 'Upgrade request created',
    type: UpgradeRequestDto
  })
  async requestUpgrade(
    @Body() createUpgradeDto: CreateUpgradeDto,
    @Request() req: RequestWithUser
  ): Promise<UpgradeRequestDto> {
    // Validate upgrade eligibility
    const eligibility = await this.vipUpgradeService.checkUpgradeEligibility(
      req.user.userId,
      createUpgradeDto.targetLevelId
    );

    if (!eligibility.eligible) {
      throw new BadRequestException(eligibility.reason);
    }

    // Distribute to admin via round-robin
    const assignedAdminId = await this.roundRobinService.assignAdmin('upgrade');

    return this.vipUpgradeService.createUpgradeRequest(
      req.user.userId,
      createUpgradeDto,
      assignedAdminId,
      eligibility.amountDifference
    );
  }

  @Get('admin/pending')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending upgrade requests (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Pending upgrade requests',
    type: [UpgradeRequestDto]
  })
  async getPendingUpgradeRequests(
    @Query('adminId') adminId: number
  ): Promise<UpgradeRequestDto[]> {
    return this.vipUpgradeService.getPendingRequestsByAdmin(adminId);
  }

  @Post('admin/approve')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve upgrade request (Admin)' })
  @ApiBody({ type: UpgradeApprovalDto })
  @ApiResponse({ status: 200, description: 'Upgrade processed successfully' })
  async approveUpgrade(
    @Body() approvalDto: UpgradeApprovalDto
  ): Promise<void> {
    await this.vipUpgradeService.processUpgradeApproval(
      approvalDto.requestId,
      approvalDto.adminId,
      approvalDto.approved,
      approvalDto.notes,
      approvalDto.paymentProofUrl
    );
  }

  @Get('user/history')
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user upgrade history' })
  @ApiResponse({
    status: 200,
    description: 'User upgrade history',
    type: [UpgradeRequestDto]
  })
  async getUserUpgradeHistory(
    @Request() req: RequestWithUser
  ): Promise<UpgradeRequestDto[]> {
    return this.vipUpgradeService.getUserUpgradeHistory(req.user.userId);
  }
}