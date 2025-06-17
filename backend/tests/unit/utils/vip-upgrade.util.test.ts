import { calculateUpgradeRequirements } from '../../src/utils/vip-upgrade.util';
import { VIPLevel } from '../../src/models';
import db from '../../src/config/database';

describe('VIP Upgrade Utility', () => {
  beforeAll(async () => {
    await db.sync({ force: true });
    await VIPLevel.bulkCreate([
      { level_id: 1, investment_amount: 1200, daily_earning: 40, per_task_earning: 10, min_withdrawal: 40, max_total_withdrawal: 4800, investment_area: 'L1', daily_tasks: [] },
      { level_id: 2, investment_amount: 3000, daily_earning: 100, per_task_earning: 25, min_withdrawal: 100, max_total_withdrawal: 12000, investment_area: 'L2', daily_tasks: [] },
      { level_id: 3, investment_amount: 6000, daily_earning: 200, per_task_earning: 50, min_withdrawal: 200, max_total_withdrawal: 24000, investment_area: 'L3', daily_tasks: [] }
    ]);
  });

  test('should calculate correct upgrade requirements', async () => {
    const currentLevel = 1;
    const currentBalance = 500;
    const targetLevel = 3;

    const result = await calculateUpgradeRequirements(currentLevel, targetLevel, currentBalance);

    expect(result).toEqual({
      currentLevel: 1,
      targetLevel: 3,
      levelDifference: 2,
      amountDifference: 4800, // 6000 - 1200
      currentBalance: 500,
      additionalRequired: 4300, // 4800 - 500
      sufficientBalance: false
    });
  });

  test('should handle sufficient balance scenario', async () => {
    const currentLevel = 1;
    const currentBalance = 5000;
    const targetLevel = 2;

    const result = await calculateUpgradeRequirements(currentLevel, targetLevel, currentBalance);

    expect(result).toEqual({
      currentLevel: 1,
      targetLevel: 2,
      levelDifference: 1,
      amountDifference: 1800, // 3000 - 1200
      currentBalance: 5000,
      additionalRequired: 0,
      sufficientBalance: true,
      remainingBalance: 3200 // 5000 - 1800
    });
  });
});