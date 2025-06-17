import { Server } from 'socket.io';
import http from 'http';
import { redisSubscriber } from './redis';
import appConfig from './app';
import { Admin } from '../models';

interface SocketAuth {
  token?: string;
  adminId?: string;
}

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: appConfig.nodeEnv === 'development' 
        ? '*' 
        : process.env.FRONTEND_URL!,
      methods: ['GET', 'POST']
    }
  });

  // Admin namespace for real-time dashboard updates
  const adminNamespace = io.of('/admin');

  adminNamespace.use(async (socket, next) => {
    const { token, adminId } = socket.handshake.auth as SocketAuth;
    
    if (!token || !adminId) {
      return next(new Error('Authentication error'));
    }

    try {
      const admin = await Admin.findByPk(adminId);
      if (!admin || !admin.isActive) {
        return next(new Error('Admin not found or inactive'));
      }

      socket.data.admin = admin;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Subscribe to Redis channels for real-time updates
  redisSubscriber.subscribe(
    'purchase_requests',
    'withdrawal_requests',
    'upgrade_requests',
    'system_stats'
  );

  redisSubscriber.on('message', (channel, message) => {
    adminNamespace.emit(channel, JSON.parse(message));
  });

  return io;
};