import { Controller, Get, Post, Body, Delete, Param, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminIPWhitelistService } from '../services/admin-ip-whitelist.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { AddIpDto } from '../dto/add-ip.dto';
import { HighLevelAdminGuard } from '../../guards/high-level-admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller('hidden-admin/auth/ip-whitelist')
@UseGuards(HighLevelAdminGuard)
@ApiTags('Admin Auth - IP Whitelist')
@ApiBearerAuth()
export class AdminIPWhitelistController {
  constructor(
    private readonly ipWhitelistService: AdminIPWhitelistService,
    private readonly auditLog: AuditLogService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all whitelisted IPs' })
  @ApiResponse({ status: 200, description: 'List of whitelisted IPs' })
  async getAllWhitelistedIPs(@Req() request: Request) {
    try {
      const adminId = request['admin'].id;
      const ips = await this.ipWhitelistService.getAllWhitelistedIPs();

      await this.auditLog.log({
        action: 'IP_WHITELIST_VIEWED',
        adminId,
        description: 'Viewed IP whitelist',
      });

      return ips;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve IP whitelist',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Add IP to whitelist' })
  @ApiBody({ type: AddIpDto })
  @ApiResponse({ status: 201, description: 'IP added to whitelist' })
  async addToWhitelist(@Body() addIpDto: AddIpDto, @Req() request: Request) {
    try {
      const adminId = request['admin'].id;
      const result = await this.ipWhitelistService.addToWhitelist(addIpDto.ip, addIpDto.description);

      await this.auditLog.log({
        action: 'IP_WHITELIST_ADDED',
        adminId,
        description: `Added IP ${addIpDto.ip} to whitelist`,
        metadata: { ip: addIpDto.ip, description: addIpDto.description },
      });

      return {
        message: 'IP added to whitelist',
        ip: result.ip,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add IP to whitelist',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':ip')
  @ApiOperation({ summary: 'Remove IP from whitelist' })
  @ApiParam({ name: 'ip', description: 'IP address to remove' })
  @ApiResponse({ status: 200, description: 'IP removed from whitelist' })
  async removeFromWhitelist(@Param('ip') ip: string, @Req() request: Request) {
    try {
      const adminId = request['admin'].id;
      await this.ipWhitelistService.removeFromWhitelist(ip);

      await this.auditLog.log({
        action: 'IP_WHITELIST_REMOVED',
        adminId,
        description: `Removed IP ${ip} from whitelist`,
        metadata: { ip },
      });

      return { message: 'IP removed from whitelist' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove IP from whitelist',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify if IP is whitelisted' })
  @ApiBody({ type: AddIpDto })
  @ApiResponse({ status: 200, description: 'Verification result' })
  async verifyIP(@Body() addIpDto: AddIpDto) {
    try {
      const isWhitelisted = await this.ipWhitelistService.isIPWhitelisted(addIpDto.ip);
      return { isWhitelisted };
    } catch (error) {
      throw new HttpException(
        'Failed to verify IP',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}