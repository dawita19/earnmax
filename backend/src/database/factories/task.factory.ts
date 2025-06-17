import { PrismaClient, DailyTask, TaskHistory } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

type TaskFactoryOptions = {
  userId: number;
  vipLevel?: number;
  isCompleted?: boolean;
  daysAgo?: number;
};

export async function createDailyTask(options: TaskFactoryOptions): Promise<DailyTask> {
  const {
    userId,
    vipLevel = 0,
    isCompleted = false,
    daysAgo = 0
  } = options;

  const taskTypes = [
    { type: 'view_ad', description: 'View advertisement', earnings: 5.00 },
    { type: 'click_ad', description: 'Click advertisement', earnings: 10.00 },
    { type: 'share_post', description: 'Share social media post', earnings: 5.00 },
    { type: 'watch_video', description: 'Watch promotional video', earnings: 5.00 }
  ];

  const taskType = faker.helpers.arrayElement(taskTypes);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);

  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + 1);

  return prisma.dailyTask.create({
    data: {
      user_id: userId,
      vip_level: vipLevel,
      task_type: taskType.type,
      task_description: taskType.description,
      earnings: taskType.earnings * (vipLevel + 1),
      is_completed: isCompleted,
      created_at: createdAt,
      expires_at: expiresAt
    }
  });
}

export async function createCompletedTaskWithHistory(
  options: TaskFactoryOptions
): Promise<{ task: DailyTask; history: TaskHistory }> {
  const task = await createDailyTask({ ...options, isCompleted: true });
  
  const history = await prisma.taskHistory.create({
    data: {
      user_id: task.user_id,
      task_id: task.task_id,
      vip_level: task.vip_level,
      task_type: task.task_type,
      earnings: task.earnings,
      completed_at: new Date(),
      ip_address: faker.internet.ipv4()
    }
  });
  
  return { task, history };
}

export async function generateDailyTasksForUser(
  userId: number,
  vipLevel: number
): Promise<DailyTask[]> {
  const tasks = [];
  const taskCount = 4; // 4 tasks per day per VIP level
  
  for (let i = 0; i < taskCount; i++) {
    tasks.push(await createDailyTask({ userId, vipLevel }));
  }
  
  return tasks;
}