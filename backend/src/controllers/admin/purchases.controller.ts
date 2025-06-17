import { Controller, Get, Post, Param, Body, Headers, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PurchaseService } from '../../../services/admin/purchase.service';
import { RoundRobinService } from '../../../services/round-robin.service';
import { ApprovePurchaseDto } from '../../../dto/admin/purchase/approve.dto';
import { AuditLogService } from '../../../services/audit-log.service';

@Controller('admin/purchases')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly roundRobin: RoundRobinService,
    private readonly auditLog: AuditLogService
  ) {}

  @Get('pending')
  @AdminAuthGuard()
  async getPendingPurchases(@Headers('authorization') authHeader: string, @Res() res: Response) {
    try {
      const token = authHeader.split(' ')[1];
      const adminId = this.roundRobin.getAdminIdFromToken(token);
      
      // Get requests assigned to this admin via round-robin
      const requests = await this.purchaseService.getAssignedRequests(adminId);
      
      return res.status(HttpStatus.OK).json({
        requests,
        totalAmount: requests.reduce((sum, req) => sum + req.amount, 0)
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to load pending purchases'
      });
    }
  }

  @Post('approve/:requestId')
  @AdminAuthGuard()
  async approvePurchase(
    @Param('requestId') requestId: string,
    @Body() approvalData: ApprovePurchaseDto,
    @Headers('authorization') authHeader: string,
    @Res() res: Response
  ) {
    try {
      const token = authHeader.split(' ')[1];
      const adminId = this.roundRobin.getAdminIdFromToken(token);

      // Verify admin owns this request
      const ownsRequest = await this.purchaseService.verifyAdminOwnership(requestId, adminId);
      if (!ownsRequest) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'Not authorized to approve this request'
        });
      }

      // Process approval
      const result = await this.purchaseService.approveRequest(
        requestId,
        adminId,
        approvalData.adminNotes
      );

      // Log approval
      await this.auditLog.logPurchaseApproval(
        adminId,
        requestId,
        result.userId,
        result.amount
      );

      return res.status(HttpStatus.OK).json({
        message: 'Purchase approved successfully',
        updatedUser: result.updatedUser
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to approve purchase'
      });
    }
  }

  @Post('reject/:requestId')
  @AdminAuthGuard()
  async rejectPurchase(
    @Param('requestId') requestId: string,
    @Body('rejectionReason') rejectionReason: string,
    @Headers('authorization') authHeader: string,
    @Res() res: Response
  ) {
    try {
      const token = authHeader.split(' ')[1];
      const adminId = this.roundRobin.getAdminIdFromToken(token);

      // Process rejection
      await this.purchaseService.rejectRequest(
        requestId,
        adminId,
        rejectionReason
      );

      // Log rejection
      await this.auditLog.logPurchaseRejection(adminId, requestId, rejectionReason);

      return res.status(HttpStatus.OK).json({
        message: 'Purchase rejected successfully'
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to reject purchase'
      });
    }
  }
}