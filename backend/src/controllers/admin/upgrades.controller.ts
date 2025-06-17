import { Controller, Get, Post, Param, Body, Headers, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { UpgradeService } from '../../../services/admin/upgrade.service';
import { RoundRobinService } from '../../../services/round-robin.service';
import { ApproveUpgradeDto } from '../../../dto/admin/upgrade/approve.dto';
import { AuditLogService } from '../../../services/audit-log.service';

@Controller('admin/upgrades')
export class UpgradeController {
  constructor(
    private readonly upgradeService: UpgradeService,
    private readonly roundRobin: RoundRobinService,
    private readonly auditLog: AuditLogService
  ) {}

  @Get('pending')
  @AdminAuthGuard()
  async getPendingUpgrades(@Headers('authorization') authHeader: string, @Res() res: Response) {
    try {
      const token = authHeader.split(' ')[1];
      const adminId = this.roundRobin.getAdminIdFromToken(token);
      
      // Get requests assigned to this admin via round-robin
      const requests = await this.upgradeService.getAssignedRequests(adminId);
      
      return res.status(HttpStatus.OK).json({
        requests,
        totalAmount: requests.reduce((sum, req) => sum + req.upgradeDifference, 0),
        totalRecharge: requests.reduce((sum, req) => sum + req.rechargeAmount, 0)
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to load pending upgrades'
      });
    }
  }

  @Post('approve/:requestId')
  @AdminAuthGuard()
  async approveUpgrade(
    @Param('requestId') requestId: string,
    @Body() approvalData: ApproveUpgradeDto,
    @Headers('authorization') authHeader: string,
    @Res() res: Response
  ) {
    try {
      const token = authHeader.split(' ')[1];
      const adminId = this.roundRobin.getAdminIdFromToken(token);

      // Verify admin owns this request
      const ownsRequest = await this.upgradeService.verifyAdminOwnership(requestId, adminId);
      if (!ownsRequest) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'Not authorized to approve this request'
        });
      }

      // Process approval
      const result = await this.upgradeService.approveRequest(
        requestId,
        adminId,
        approvalData.adminNotes
      );

      // Log approval
      await this.auditLog.logUpgradeApproval(
        adminId,
        requestId,
        result.userId,
        result.oldLevel,
        result.newLevel,
        result.rechargeAmount
      );

      return res.status(HttpStatus.OK).json({
        message: 'Upgrade approved successfully',
        updatedUser: result.updatedUser,
        referralBonuses: result.referralBonuses
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to approve upgrade'
      });
    }
  }

  @Post('reject/:requestId')
  @AdminAuthGuard()
  async rejectUpgrade(
    @Param('requestId') requestId: string,
    @Body('rejectionReason') rejectionReason: string,
    @Headers('authorization') authHeader: string,
    @Res() res: Response
  ) {
    try {
      const token = authHeader.split(' ')[1];
      const adminId = this.roundRobin.getAdminIdFromToken(token);

      // Process rejection
      const result = await this.upgradeService.rejectRequest(
        requestId,
        adminId,
        rejectionReason
      );

      // Log rejection
      await this.auditLog.logUpgradeRejection(adminId, requestId, rejectionReason);

      return res.status(HttpStatus.OK).json({
        message: 'Upgrade rejected successfully',
        refundAmount: result.refundAmount
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to reject upgrade'
      });
    }
  }
}