import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { SocketService } from '../system/socket.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly socketService: SocketService,
  ) {}

  async create(
    userId: number,
    title: string,
    message: string,
    notificationType: string,
    referenceId?: number,
  ) {
    const notification = this.notificationRepository.create({
      user_id: userId,
      title,
      message,
      notification_type: notificationType,
      reference_id: referenceId,
    });

    await this.notificationRepository.save(notification);

    // Send real-time notification via WebSocket
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      select: ['user_id', 'last_login'],
    });

    if (user?.last_login) {
      this.socketService.sendToUser(userId, 'new_notification', {
        id: notification.notification_id,
        title,
        message,
        type: notificationType,
        referenceId,
        createdAt: notification.created_at,
        isRead: false,
      });
    }

    return notification;
  }

  async getUserNotifications(userId: number, unreadOnly: boolean = false) {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy('notification.created_at', 'DESC');

    if (unreadOnly) {
      query.andWhere('notification.is_read = false');
    }

    return query.getMany();
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { notification_id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.is_read) {
      notification.is_read = true;
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );

    return { success: true, message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: number) {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }
}