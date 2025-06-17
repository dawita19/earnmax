import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLoan } from '../entities/user-loan.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(UserLoan)
    private readonly loanRepository: Repository<UserLoan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUserLoan(userId: number, amount: number, currentBalance: number) {
    const existingLoan = await this.loanRepository.findOne({
      where: { user_id: userId, status: 'active' },
    });

    if (existingLoan) {
      throw new Error('User already has an active loan');
    }

    const loan = this.loanRepository.create({
      user_id: userId,
      original_amount: amount,
      current_balance: currentBalance,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.loanRepository.save(loan);
  }

  async updateUserLoan(userId: number, newAmount: number) {
    const loan = await this.loanRepository.findOne({
      where: { user_id: userId, status: 'active' },
    });

    if (!loan) {
      throw new Error('No active loan found for user');
    }

    const amountDifference = newAmount - loan.original_amount;
    loan.original_amount = newAmount;
    loan.current_balance += amountDifference;
    loan.updated_at = new Date();

    return this.loanRepository.save(loan);
  }

  async addLoanProfit(userId: number, profitAmount: number) {
    const loan = await this.loanRepository.findOne({
      where: { user_id: userId, status: 'active' },
    });

    if (!loan) {
      throw new Error('No active loan found for user');
    }

    loan.total_profit += profitAmount;
    loan.updated_at = new Date();

    return this.loanRepository.save(loan);
  }

  async getUserLoanStatus(userId: number) {
    return this.loanRepository.findOne({
      where: { user_id: userId, status: 'active' },
    });
  }

  async closeLoan(userId: number) {
    const loan = await this.loanRepository.findOne({
      where: { user_id: userId, status: 'active' },
    });

    if (!loan) {
      throw new Error('No active loan found for user');
    }

    loan.status = 'closed';
    loan.updated_at = new Date();

    return this.loanRepository.save(loan);
  }
}