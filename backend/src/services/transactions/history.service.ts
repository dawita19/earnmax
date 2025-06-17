import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EarningsHistory } from '../../entities/earnings-history.entity';
import { TaskHistory } from '../../entities/task-history.entity';
import { ReferralBonus } from '../../entities/referral-bonus.entity';
import { WithdrawalRequest } from '../../entities/withdrawal-request.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(EarningsHistory)
    private readonly earningsHistoryRepository: Repository<EarningsHistory>,
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
    @InjectRepository(ReferralBonus)
    private readonly referralBonusRepository: Repository<ReferralBonus>,
    @InjectRepository(WithdrawalRequest)
    private readonly withdrawalRepository: Repository<WithdrawalRequest>,
  ) {}

  async getEarningsHistory(userId: number, pagination: PaginationDto) {
    const [items, count] = await this.earningsHistoryRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      items,
      total: count,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async getTaskHistory(userId: number, vipLevel?: number) {
    const query = this.taskHistoryRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .orderBy('task.completed_at', 'DESC');

    if (vipLevel !== undefined) {
      query.andWhere('task.vip_level = :vipLevel', { vipLevel });
    }

    return query.getMany();
  }

  async getReferralBonuses(inviterId: number) {
    return this.referralBonusRepository.find({
      where: { inviter_id: inviterId },
      order: { created_at: 'DESC' },
      relations: ['invitee'],
    });
  }

  async getCombinedActivityHistory(userId: number, days: number = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const [earnings, tasks, referrals, withdrawals] = await Promise.all([
      this.earningsHistoryRepository.find({
        where: {
          user_id: userId,
          created_at: { $gte: dateThreshold },
        },
        order: { created_at: 'DESC' },
        take: 50,
      }),
      this.taskHistoryRepository.find({
        where: {
          user_id: userId,
          completed_at: { $gte: dateThreshold },
        },
        order: { completed_at: 'DESC' },
        take: 50,
      }),
      this.referralBonusRepository.find({
        where: {
          inviter_id: userId,
          created_at: { $gte: dateThreshold },
        },
        order: { created_at: 'DESC' },
        take: 50,
        relations: ['invitee'],
      }),
      this.withdrawalRepository.find({
        where: {
          user_id: userId,
          created_at: { $gte: dateThreshold },
        },
        order: { created_at: 'DESC' },
        take: 50,
      }),
    ]);

    // Combine and sort all activities by date
    const combined = [
      ...earnings.map(e => ({ ...e, type: 'earning' })),
      ...tasks.map(t => ({ ...t, type: 'task' })),
      ...referrals.map(r => ({ ...r, type: 'referral' })),
      ...withdrawals.map(w => ({ ...w, type: 'withdrawal' })),
    ].sort((a, b) => {
      const dateA = a.type === 'task' ? a.completed_at : a.created_at;
      const dateB = b.type === 'task' ? b.completed_at : b.created_at;
      return dateB.getTime() - dateA.getTime();
    });

    return combined.slice(0, 50);
  }
}