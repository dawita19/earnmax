// backend/tests/unit/utils/task-assignment.util.test.ts
import { generateDailyTasks } from '../../../src/utils/task-assignment.util';
import { VIPLevel } from '../../../src/constants/vip.constants';

describe('Daily Task Generation', () => {
  it('should generate 4 tasks for VIP level', () => {
    const tasks = generateDailyTasks(VIPLevel.LEVEL_3);
    expect(tasks.length).toBe(4);
    expect(tasks[0].earnings).toBe(50); // LEVEL_3 per-task earnings
  });

  it('should include unique task types', () => {
    const tasks = generateDailyTasks(VIPLevel.LEVEL_5);
    const taskTypes = tasks.map(t => t.task_type);
    const uniqueTypes = new Set(taskTypes);
    expect(uniqueTypes.size).toBe(taskTypes.length);
  });

  it('should set expiration 24 hours ahead', () => {
    const now = new Date();
    const tasks = generateDailyTasks(VIPLevel.LEVEL_2);
    const expiresAt = new Date(tasks[0].expires_at);
    
    expect(expiresAt.getTime() - now.getTime()).toBeCloseTo(
      24 * 60 * 60 * 1000, // 24 hours in ms
      -3 // Allow 1 second variance
    );
  });
});