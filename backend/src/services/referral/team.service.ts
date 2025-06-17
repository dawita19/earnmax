import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { ReferralNetworkService } from './network.service';
import { VipLevelsService } from '../../vip/vip-levels.service';

@Injectable()
export class TeamService {
  constructor(
    private readonly usersService: UsersService,
    private readonly networkService: ReferralNetworkService,
    private readonly vipLevelsService: VipLevelsService,
  ) {}

  async getTeamOverview(userId: number) {
    const user = await this.usersService.findById(userId);
    
    const levels = [1, 2, 3, 4];
    const teamCounts = await Promise.all(
      levels.map(level => this.networkService.getNetwork(userId, level))
    );
    
    const activeMembers = await this.getActiveMembersCount(userId);
    const vipDistribution = await this.getVipDistribution(userId);
    
    return {
      totalMembers: user.total_invites,
      firstLevel: user.first_level_invites,
      secondLevel: user.second_level_invites,
      thirdLevel: user.third_level_invites,
      fourthLevel: user.fourth_level_invites,
      activeMembers,
      vipDistribution,
      totalBonus: user.total_referral_bonus,
      teamCounts,
    };
  }

  async getActiveMembersCount(userId: number, days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.usersService
      .getActiveReferralsCount(userId, date);
  }

  async getVipDistribution(userId: number) {
    const distribution = await this.usersService
      .getReferralVipDistribution(userId);
    
    return this.vipLevelsService.enrichVipDistribution(distribution);
  }

  async getTeamPerformance(userId: number) {
    const [weekly, monthly] = await Promise.all([
      this.getTeamEarnings(userId, 7),
      this.getTeamEarnings(userId, 30),
    ]);
    
    return { weekly, monthly };
  }

  private async getTeamEarnings(userId: number, days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const directEarnings = await this.usersService
      .getDirectReferralEarnings(userId, date);
    
    const indirectEarnings = await this.usersService
      .getIndirectReferralEarnings(userId, date);
    
    return {
      direct: directEarnings,
      indirect: indirectEarnings,
      total: directEarnings + indirectEarnings,
    };
  }
}