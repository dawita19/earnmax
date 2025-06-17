import { SocketEvent } from './types';

export const emitSocketEvent = (
  socket: Socket | null,
  event: SocketEvent,
  data: any
) => {
  if (!socket) {
    console.warn('Socket not connected, cannot emit event');
    return false;
  }
  
  try {
    socket.emit(event, data);
    return true;
  } catch (error) {
    console.error('Error emitting socket event:', error);
    return false;
  }
};

export const formatAdminMetrics = (metrics: AdminMetrics) => {
  return {
    ...metrics,
    totalRevenue: parseFloat(metrics.totalRevenue.toFixed(2)),
    vipDistribution: Object.entries(metrics.vipDistribution).reduce(
      (acc, [level, count]) => {
        acc[`VIP ${level}`] = count;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
};