import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { VipLevel } from '../../entities/vip-level.entity';
import { ReferralNetwork } from '../../entities/referral-network.entity';
import { WithdrawalRequest } from '../../entities/withdrawal-request.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { PaymentMethod } from '../../entities/payment-method.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
    @InjectRepository(ReferralNetwork)
    private readonly referralNetworkRepository: Repository<ReferralNetwork>,
    @InjectRepository(WithdrawalRequest)
    private readonly withdrawalRepository: Repository<WithdrawalRequest>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new Error('User not found');

    const vipLevel = await this.vipLevelRepository.findOne({ 
      where: { level_id: user.vip_level },
    });

    const totalTeam = await this.referralNetworkRepository.count({
      where: { inviter_id: userId },
    });

    const pendingWithdrawals = await this.withdrawalRepository.count({
      where: { user_id: userId, status: 'pending' },
    });

    return {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email,
        vip_level: user.vip_level,
        vip_amount: user.vip_amount,
        balance: user.balance,
        total_earnings: user.total_earnings,
        total_withdrawn: user.total_withdrawn,
        total_referral_bonus: user.total_referral_bonus,
        join_date: user.join_date,
        last_login: user.last_login,
      },
      vip_info: vipLevel ? {
        level_name: `VIP ${vipLevel.level_id}`,
        daily_earning: vipLevel.daily_earning,
        per_task_earning: vipLevel.per_task_earning,
        min_withdrawal: vipLevel.min_withdrawal,
        max_total_withdrawal: vipLevel.max_total_withdrawal,
      } : null,
      stats: {
        total_team: totalTeam,
        first_level: user.first_level_invites,
        second_level: user.second_level_invites,
        third_level: user.third_level_invites,
        fourth_level: user.fourth_level_invites,
        pending_withdrawals,
      },
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updates: Partial<User> = {};

    if (dto.full_name) updates.full_name = dto.full_name;
    if (dto.email) updates.email = dto.email;
    if (dto.payment_method) {
      const method = await this.paymentMethodRepository.findOne({
        where: { method_id: dto.payment_method },
      });
      if (!method) throw new Error('Invalid payment method');
      updates.payment_method = method.method_name;
      updates.payment_details = dto.payment_details;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    await this.userRepository.update(userId, updates);
    return this.getUserProfile(userId);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      select: ['user_id', 'password_hash'],
    });

    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(dto.current_password, user.password_hash);
    if (!isMatch) throw new Error('Current password is incorrect');

    if (dto.new_password !== dto.confirm_password) {
      throw new Error('New passwords do not match');
    }

    const newHash = await bcrypt.hash(dto.new_password, 10);
    await this.userRepository.update(userId, { password_hash: newHash });

    return { success: true, message: 'Password changed successfully' };
  }

  async getPaymentMethods() {
    return this.paymentMethodRepository.find({ where: { is_active: true } });
  }

  async getInviteCode(userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      select: ['user_id', 'invite_code'],
    });

    if (!user) throw new Error('User not found');

    return {
      invite_code: user.invite_code,
      invite_link: `https://earnmaxelite.com/register?ref=${user.invite_code}`,
    };
  }
}