import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from '../entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class NotificationWorker implements OnModuleInit {
  @WebSocketServer()
  private server: Server;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>
  ) {}

  onModuleInit() {
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.server.on('connection', (client) => {
      client.on('authenticate', async (data: { userId?: number; adminId?: number }) => {
        if (data.userId) {
          client.join(`user-${data.userId}`);
        } else if (data.adminId) {
          client.join(`admin-${data.adminId}`);
        }
      });
    });
  }

  async createUserNotification(userId: number, title: string, message: string, referenceId?: number) {
    const notification = this.notificationRepository.create({
      user_id: userId,
      title,
      message,
      notification_type: 'user',
      reference_id: referenceId
    });

    await this.notificationRepository.save(notification);
    this.server.to(`user-${userId}`).emit('new_notification', notification);
    return notification;
  }

  async createAdminNotification(adminId: number, title: string, message: string, referenceId?: number) {
    const notification = this.notificationRepository.create({
      admin_id: adminId,
      title,
      message,
      notification_type: 'admin',
      reference_id: referenceId
    });

    await this.notificationRepository.save(notification);
    this.server.to(`admin-${adminId}`).emit('new_notification', notification);
    return notification;
  }

  async sendRealTimeUpdate(channel: 'users' | 'admins', event: string, data: any) {
    this.server.to(channel).emit(event, data);
  }

  async processUnsentNotifications() {
    const unsentNotifications = await this.notificationRepository.find({
      where: { is_sent: false },
      take: 100
    });

    for (const notification of unsentNotifications) {
      if (notification.user_id) {
        const user = await this.userRepository.findOne({ where: { user_id: notification.user_id } });
        if (user) {
          this.server.to(`user-${user.user_id}`).emit('new_notification', notification);
          notification.is_sent = true;
        }
      } else if (notification.admin_id) {
        const admin = await this.adminRepository.findOne({ where: { admin_id: notification.admin_id } });
        if (admin) {
          this.server.to(`admin-${admin.admin_id}`).emit('new_notification', notification);
          notification.is_sent = true;
        }
      }
      await this.notificationRepository.save(notification);
    }
  }
}