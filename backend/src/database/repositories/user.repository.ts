import { Op } from 'sequelize';
import User from '../models/user.model';
import VIPLevel from '../models/vip-level.model';
import ReferralNetwork from '../models/referral-network.model';

class UserRepository {
  async createUser(userData: {
    full_name: string;
    phone_number: string;
    email?: string;
    password_hash: string;
    ip_address?: string;
    inviter_id?: number;
    invite_code: string;
  }): Promise<User> {
    return User.create(userData);
  }

  async findById(userId: number): Promise<User | null> {
    return User.findByPk(userId);
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return User.findOne({ where: { phone_number: phoneNumber } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findByInviteCode(inviteCode: string): Promise<User | null> {
    return User.findOne({ where: { invite_code: inviteCode } });
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<[number, User[]]> {
    return User.update(updates, {
      where: { user_id: userId },
      returning: true,
    });
  }

  async updateVipLevel(userId: number, newLevel: number, amount: number): Promise<void> {
    await User.update(
      { vip_level: newLevel, vip_amount: amount },
      { where: { user_id: userId } }
    );
  }

  async updateBalance(userId: number, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    const newBalance = operation === 'add' 
      ? user.balance + amount 
      : user.balance - amount;

    await user.update({ balance: newBalance });
  }

  async getReferralNetwork(userId: number): Promise<{
    firstLevel: User[];
    secondLevel: User[];
    thirdLevel: User[];
    fourthLevel: User[];
  }> {
    const firstLevel = await User.findAll({
      where: { inviter_id: userId },
    });

    const secondLevel = await User.findAll({
      where: { inviter_id: { [Op.in]: firstLevel.map(u => u.user_id) } },
    });

    const thirdLevel = await User.findAll({
      where: { inviter_id: { [Op.in]: secondLevel.map(u => u.user_id) } },
    });

    const fourthLevel = await User.findAll({
      where: { inviter_id: { [Op.in]: thirdLevel.map(u => u.user_id) } },
    });

    return { firstLevel, secondLevel, thirdLevel, fourthLevel };
  }

  async processReferralBonus(
    inviterId: number | null,
    amount: number,
    source: 'purchase' | 'upgrade' | 'task',
    sourceId: number
  ): Promise<void> {
    if (!inviterId) return;

    // Get 4 levels of referrers
    const referrers = await this.getReferralNetwork(inviterId);
    
    // Calculate and distribute bonuses
    const bonuses = [
      { level: 1, percent: 0.2, users: referrers.firstLevel },
      { level: 2, percent: 0.1, users: referrers.secondLevel },
      { level: 3, percent: 0.05, users: referrers.thirdLevel },
      { level: 4, percent: 0.02, users: referrers.fourthLevel },
    ];

    for (const bonus of bonuses) {
      for (const user of bonus.users) {
        const bonusAmount = amount * bonus.percent;
        await this.updateBalance(user.user_id, bonusAmount, 'add');
        
        // Record in referral_bonuses table would go here
        // await ReferralBonus.create({ ... });
        
        // Update user's referral stats
        await user.update({
          total_referral_bonus: user.total_referral_bonus + bonusAmount,
          total_earnings: user.total_earnings + bonusAmount,
        });
      }
    }
  }
}

export default new UserRepository();