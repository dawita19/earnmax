import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralNetwork } from '../entities/referral-network.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ReferralNetworkService {
  constructor(
    @InjectRepository(ReferralNetwork)
    private readonly referralRepo: Repository<ReferralNetwork>,
    private readonly usersService: UsersService,
  ) {}

  async validateInviteCode(code: string): Promise<number> {
    const user = await this.usersService.findByInviteCode(code);
    if (!user) {
      throw new Error('Invalid invitation code');
    }
    return user.user_id;
  }

  async buildNetwork(inviterId: number, inviteeId: number) {
    // Get inviter's network up to 4 levels
    const inviterNetwork = await this.referralRepo.find({
      where: { invitee_id: inviterId },
      order: { level: 'ASC' },
      take: 3, // We only need up to level 4 (existing level + 3 more)
    });

    // Create direct relationship (level 1)
    await this.createRelationship(inviterId, inviteeId, 1);
    
    // Create indirect relationships (levels 2-4)
    for (const relation of inviterNetwork) {
      if (relation.level < 4) {
        await this.createRelationship(
          relation.inviter_id,
          inviteeId,
          relation.level + 1
        );
      }
    }

    // Update user's invite counters
    await this.updateInviteCounters(inviterId);
  }

  private async createRelationship(
    inviterId: number,
    inviteeId: number,
    level: number
  ) {
    const exists = await this.referralRepo.findOne({
      where: { inviter_id: inviterId, invitee_id: inviteeId },
    });
    
    if (!exists) {
      await this.referralRepo.save({
        inviter_id: inviterId,
        invitee_id: inviteeId,
        level,
      });
      
      // Update user's referral stats
      await this.usersService.updateReferralStats(inviterId, level);
    }
  }

  private async updateInviteCounters(inviterId: number) {
    const levels = await this.referralRepo
      .createQueryBuilder()
      .select('level, COUNT(*) as count')
      .where('inviter_id = :inviterId', { inviterId })
      .groupBy('level')
      .getRawMany();

    const updates = {
      first_level_invites: 0,
      second_level_invites: 0,
      third_level_invites: 0,
      fourth_level_invites: 0,
      total_invites: 0,
    };

    for (const level of levels) {
      updates.total_invites += parseInt(level.count);
      switch (level.level) {
        case 1:
          updates.first_level_invites = parseInt(level.count);
          break;
        case 2:
          updates.second_level_invites = parseInt(level.count);
          break;
        case 3:
          updates.third_level_invites = parseInt(level.count);
          break;
        case 4:
          updates.fourth_level_invites = parseInt(level.count);
          break;
      }
    }

    await this.usersService.update(inviterId, updates);
  }

  async getNetwork(userId: number, level = 1) {
    if (level < 1 || level > 4) {
      throw new Error('Level must be between 1 and 4');
    }

    const network = await this.referralRepo
      .createQueryBuilder('rn')
      .leftJoinAndSelect('users', 'u', 'u.user_id = rn.invitee_id')
      .select([
        'u.user_id as user_id',
        'u.full_name as full_name',
        'u.vip_level as vip_level',
        'u.join_date as join_date',
        'rn.level as level',
      ])
      .where('rn.inviter_id = :userId AND rn.level = :level', { userId, level })
      .orderBy('u.join_date', 'DESC')
      .getRawMany();

    return network;
  }
}