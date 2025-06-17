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
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { VipPurchaseService } from '../services/vip-purchase.service';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { PurchaseRequestDto } from '../dto/purchase-request.dto';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { PurchaseApprovalDto } from '../dto/purchase-approval.dto';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { RoundRobinService } from '../../distribution/services/round-robin.service';

@ApiTags('VIP Purchase')
@Controller('vip/purchase')
export class VipPurchaseController {
  constructor(
    private readonly vipPurchaseService: VipPurchaseService,
    private readonly roundRobinService: RoundRobinService
  ) {}

  @Post()
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request VIP level purchase' })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiResponse({ status: 201, description: 'Purchase request created', type: PurchaseRequestDto })
  async requestPurchase(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Request() req: RequestWithUser
  ): Promise<PurchaseRequestDto> {
    // Validate user can purchase (not already at same or higher level)
    const canPurchase = await this.vipPurchaseService.validatePurchaseEligibility(
      req.user.userId,
      createPurchaseDto.levelId
    );
    
    if (!canPurchase) {
      throw new BadRequestException('You already have this VIP level or higher');
    }

    // Distribute to admin via round-robin
    const assignedAdminId = await this.roundRobinService.assignAdmin('purchase');
    
    return this.vipPurchaseService.createPurchaseRequest(
      req.user.userId,
      createPurchaseDto,
      assignedAdminId
    );
  }

  @Get('admin/pending')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending purchase requests (Admin)' })
  @ApiResponse({ status: 200, description: 'Pending requests', type: [PurchaseRequestDto] })
  async getPendingRequests(
    @Query('adminId') adminId: number
  ): Promise<PurchaseRequestDto[]> {
    return this.vipPurchaseService.getPendingRequestsByAdmin(adminId);
  }

  @Post('admin/approve')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve purchase request (Admin)' })
  @ApiBody({ type: PurchaseApprovalDto })
  @ApiResponse({ status: 200, description: 'Purchase approved successfully' })
  async approvePurchase(
    @Body() approvalDto: PurchaseApprovalDto
  ): Promise<void> {
    await this.vipPurchaseService.processApproval(
      approvalDto.requestId,
      approvalDto.adminId,
      approvalDto.approved,
      approvalDto.notes
    );
  }
}