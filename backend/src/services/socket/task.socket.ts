import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TasksService } from '../tasks.service';
import { ReferralService } from '../referral.service';

@WebSocketGateway({ namespace: '/tasks' })
export class TaskSocketGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly tasksService: TasksService,
    private readonly referralService: ReferralService
  ) {}

  async broadcastTaskCompletion(userId: string, taskId: string) {
    const task = await this.tasksService.completeTask(userId, taskId);
    const earningsUpdate = await this.tasksService.getUserEarnings(userId);
    
    // Notify user
    this.server.to(`user_${userId}`).emit('task_completed', {
      task,
      balance: earningsUpdate.balance,
      dailyEarnings: earningsUpdate.daily
    });

    // Process referral bonuses
    const referralUpdates = await this.referralService.processTaskReferrals(userId, task.earnings);
    this.notifyReferralUpdates(referralUpdates);
  }

  private notifyReferralUpdates(updates: Array<{ userId: string, amount: number }>) {
    updates.forEach(update => {
      this.server.to(`user_${update.userId}`).emit('referral_earned', {
        amount: update.amount,
        timestamp: new Date()
      });
    });
  }
}