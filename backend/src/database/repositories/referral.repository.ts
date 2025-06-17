import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ReferralNetwork } from '../entities/referral-network.entity';
import { User } from '../entities/user.entity';
import { ReferralBonus } from '../entities/referral-bonus.entity';

@Injectable()
export class ReferralRepository {
  constructor(
    @InjectRepository(ReferralNetwork)
    private readonly referralNetworkRepository: Repository<ReferralNetwork>,
    @InjectRepository(ReferralBonus)
    private readonly referralBonusRepository: Repository<ReferralBonus>,
    private readonly entityManager: EntityManager,
  ) {}

  async createReferralRelationship(
    inviterId: number,
    inviteeId: number
  ): Promise<void> {
    // Check if relationship already exists
    const exists = await this.referralNetworkRepository.findOne({
      where: { inviter_id: inviterId, invitee_id: inviteeId }
    });

    if (exists) return;

    // Create level 1 relationship
    const level1 = this.referralNetworkRepository.create({
      inviter_id: inviterId,
      invitee_id: inviteeId,
      level: 1
    });
    await this.referralNetworkRepository.save(level1);

    // Find higher level relationships
    const inviter = await this.entityManager.findOne(User, {
      where: { user_id: inviterId },
      select: ['user_id', 'inviter_id']
    });

    if (inviter?.inviter_id) {
      // Level 2
      const level2 = this.referralNetworkRepository.create({
        inviter_id: inviter.inviter_id,
        invitee_id: inviteeId,
        level: 2
      });
      await this.referralNetworkRepository.save(level2);

      // Level 3 (if exists)
      const level2Inviter = await this.entityManager.findOne(User, {
        where: { user_id: inviter.inviter_id },
        select: ['user_id', 'inviter_id']
      });

      if (level2Inviter?.inviter_id) {
        const level3 = this.referralNetworkRepository.create({
          inviter_id: level2Inviter.inviter_id,
          invitee_id: inviteeId,
          level: 3
        });
        await this.referralNetworkRepository.save(level3);

        // Level 4 (if exists)
        const level3Inviter = await this.entityManager.findOne(User, {
          where: { user_id: level2Inviter.inviter_id },
          select: ['user_id', 'inviter_id']
        });

        if (level3Inviter?.inviter_id) {
          const level4 = this.referralNetworkRepository.create({
            inviter_id: level3Inviter.inviter_id,
            invitee_id: inviteeId,
            level: 4
          });
          await this.referralNetworkRepository.save(level4);
        }
      }
    }
  }

  async getReferralBonuses(
    userId: number,
    limit = 50
  ): Promise<ReferralBonus[]> {
    return this.referralBonusRepository.find({
      where: { inviter_id: userId },
      relations: ['invitee'],
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  async getTotalReferralEarnings(userId: number): Promise<number> {
    const result = await this.referralBonusRepository
      .createQueryBuilder('bonus')
      .select('SUM(bonus.amount)', 'total')
      .where('bonus.inviter_id = :userId', { userId })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getTeamStats(userId: number): Promise<{
    totalTeam: number;
    firstLevel: number;
    secondLevel: number;
    thirdLevel: number;
    fourthLevel: number;
  }> {
    const [first, second, third, fourth] = await Promise.all([
      this.referralNetworkRepository.count({
        where: { inviter_id: userId, level: 1 }
      }),
      this.referralNetworkRepository.count({
        where: { inviter_id: userId, level: 2 }
      }),
      this.referralNetworkRepository.count({
        where: { inviter_id: userId, level: 3 }
      }),
      this.referralNetworkRepository.count({
        where: { inviter_id: userId, level: 4 }
      })
    ]);

    return {
      totalTeam: first + second + third + fourth,
      firstLevel: first,
      secondLevel: second,
      thirdLevel: third,
      fourthLevel: fourth
    };
  }

  async calculateWeeklyTeamBonus(userId: number): Promise<number> {
    const user = await this.entityManager.findOne(User, {
      where: { user_id: userId }
    });

    if (!user) return 0;

    const firstLevelCount = await this.referralNetworkRepository.count({
      where: { inviter_id: userId, level: 1 }
    });

    let bonusPercentage = 0;
    if (firstLevelCount >= 20) bonusPercentage = 0.25;
    else if (firstLevelCount >= 15) bonusPercentage = 0.20;
    else if (firstLevelCount >= 10) bonusPercentage = 0.15;
    else if (firstLevelCount >= 5) bonusPercentage = 0.10;

    return user.vip_amount * bonusPercentage;
  }
}