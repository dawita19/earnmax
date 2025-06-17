import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TeamService } from '../services/team.service';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('User Team')
@ApiBearerAuth()
@Controller('user/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get team summary statistics' })
  @ApiResponse({ status: 200, description: 'Team summary retrieved' })
  async getTeamSummary(@Req() req: RequestWithUser) {
    return this.teamService.getTeamSummary(req.user.userId);
  }

  @Get('invitation-link')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user invitation link' })
  @ApiResponse({ status: 200, description: 'Invitation link retrieved' })
  async getInvitationLink(@Req() req: RequestWithUser) {
    return this.teamService.getInvitationLink(req.user.userId);
  }

  @Get('first-level')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get first level team members' })
  @ApiResponse({ status: 200, description: 'First level members retrieved' })
  async getFirstLevelTeam(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto
  ) {
    return this.teamService.getTeamMembersByLevel(
      req.user.userId,
      1,
      paginationDto
    );
  }

  @Get('second-level')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get second level team members' })
  @ApiResponse({ status: 200, description: 'Second level members retrieved' })
  async getSecondLevelTeam(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto
  ) {
    return this.teamService.getTeamMembersByLevel(
      req.user.userId,
      2,
      paginationDto
    );
  }

  @Get('bonus-history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get referral bonus history' })
  @ApiResponse({ status: 200, description: 'Bonus history retrieved' })
  async getBonusHistory(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto
  ) {
    return this.teamService.getReferralBonusHistory(
      req.user.userId,
      paginationDto
    );
  }

  @Get('weekly-bonus')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check weekly bonus eligibility' })
  @ApiResponse({ status: 200, description: 'Weekly bonus status retrieved' })
  async checkWeeklyBonus(@Req() req: RequestWithUser) {
    return this.teamService.checkWeeklyBonusEligibility(req.user.userId);
  }
}