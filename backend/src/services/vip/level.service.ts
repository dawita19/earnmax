import { Injectable } from '@nestjs/common';
import { VipLevel } from '../entities/vip-level.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VipLevelsService {
  private vipLevels: Map<number, VipLevel> = new Map();

  constructor(
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
  ) {
    this.loadVipLevels();
  }

  private async loadVipLevels() {
    const levels = await this.vipLevelRepository.find();
    levels.forEach((level) => this.vipLevels.set(level.level_id, level));
  }

  async getVipLevelConfig(level: number): Promise<VipLevel> {
    const config = this.vipLevels.get(level);
    if (!config) {
      throw new Error(`VIP level ${level} not found`);
    }
    return config;
  }

  async getAllVipLevels(): Promise<VipLevel[]> {
    return Array.from(this.vipLevels.values());
  }

  async updateVipLevel(levelId: number, updateData: Partial<VipLevel>) {
    await this.vipLevelRepository.update(levelId, updateData);
    await this.loadVipLevels(); // Reload cache
  }

  async getUpgradeRequirements(
    currentLevel: number,
    targetLevel: number,
  ): Promise<{ amountNeeded: number; rechargeRequired: number }> {
    const currentConfig = await this.getVipLevelConfig(currentLevel);
    const targetConfig = await this.getVipLevelConfig(targetLevel);

    const amountDifference = targetConfig.investment_amount - currentConfig.investment_amount;
    
    return {
      amountNeeded: amountDifference,
      rechargeRequired: amountDifference > 0 ? amountDifference : 0,
    };
  }
}