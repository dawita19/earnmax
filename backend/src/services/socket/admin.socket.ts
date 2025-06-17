import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AdminService } from '../admin.service';
import { RequestDistributionService } from '../request-distribution.service';

@WebSocketGateway({ namespace: '/admin' })
export class AdminSocketGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly adminService: AdminService,
    private readonly distributionService: RequestDistributionService
  ) {}

  afterInit(server: Server) {
    this.setupAdminMetrics();
    this.setupRequestDistribution();
  }

  private setupAdminMetrics() {
    setInterval(async () => {
      const metrics = await this.adminService.getRealtimeMetrics();
      this.server.emit('metrics_update', metrics);
    }, 5000); // Update every 5 seconds
  }

  private setupRequestDistribution() {
    this.distributionService.requestQueue$.subscribe(async ({ type, request }) => {
      const availableAdmins = await this.adminService.getAvailableAdmins();
      const assignedAdmin = this.distributionService.roundRobinAssign(availableAdmins);
      
      this.server.to(`admin_${assignedAdmin}`).emit('new_request', {
        type,
        request,
        timestamp: new Date()
      });
    });
  }

  handleConnection(client: any) {
    const adminId = client.handshake.query.adminId;
    client.join(`admin_${adminId}`);
    this.server.to(`admin_${adminId}`).emit('connection_success');
  }
}