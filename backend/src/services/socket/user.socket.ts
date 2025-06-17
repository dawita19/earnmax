import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsersService } from '../users.service';
import { VipService } from '../vip.service';

@WebSocketGateway({ namespace: '/user' })
export class UserSocketGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly vipService: VipService
  ) {}

  @SubscribeMessage('subscribe_updates')
  async handleSubscribe(client: any, payload: { userId: string }) {
    client.join(`user_${payload.userId}`);
    
    // Send initial data
    const user = await this.usersService.getUserWithRelations(payload.userId);
    this.server.to(`user_${payload.userId}`).emit('initial_data', user);
  }

  async notifyUserUpdate(userId: string) {
    const updatedUser = await this.usersService.getUserWithRelations(userId);
    this.server.to(`user_${userId}`).emit('user_update', updatedUser);
  }

  async notifyVipUpgrade(userId: string, newLevel: number) {
    const vipDetails = await this.vipService.getLevelDetails(newLevel);
    this.server.to(`user_${userId}`).emit('vip_upgraded', vipDetails);
  }
}