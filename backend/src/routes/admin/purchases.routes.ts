import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Query,
  Req
} from '@nestjs/common';
import { HiddenAdminGuard } from '../../guards/hidden-admin.guard';
import { PurchaseService } from '../../services/admin/purchase.service';
import { 
  ApprovePurchaseDto, 
  PurchaseRequestDto,
  RejectPurchaseDto 
} from '../../dto/admin/purchase.dto';
import { Request } from 'express';
import { RoundRobinService } from '../../services/core/round-robin.service';

@Controller('hidden-admin/purchases')
@UseGuards(HiddenAdminGuard)
export class PurchaseRoutes {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly roundRobin: RoundRobinService
  ) {}

  @Get()
  async getPurchaseRequests(
    @Query('status') status: 'pending' | 'approved' | 'rejected',
    @Req() req: any
  ) {
    // Round-robin distribution
    const requests = await this.roundRobin.distributeRequests(
      'purchase',
      req.user.admin_id
    );
    return requests;
  }

  @Post('approve')
  async approvePurchase(
    @Body() data: ApprovePurchaseDto,
    @Req() req: any
  ) {
    return this.purchaseService.approvePurchase(
      data.request_id, 
      req.user.admin_id,
      data.admin_notes
    );
  }

  @Post('reject')
  async rejectPurchase(
    @Body() data: RejectPurchaseDto,
    @Req() req: any
  ) {
    return this.purchaseService.rejectPurchase(
      data.request_id,
      req.user.admin_id,
      data.reason
    );
  }

  @Get('metrics')
  async getPurchaseMetrics() {
    return {
      totalAmount: await this.purchaseService.getTotalPurchaseAmount(),
      count: await this.purchaseService.getPurchaseCount(),
      todayAmount: await this.purchaseService.getTodayPurchaseAmount()
    };
  }
}