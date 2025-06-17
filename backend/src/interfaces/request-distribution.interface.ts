export interface RequestDistributionMetrics {
  totalRequests: number;
  requestsPerAdmin: Record<number, number>;
  avgProcessingTime: number;
  approvalRate: number;
}

export interface AdminWorkload {
  admin_id: number;
  username: string;
  pending_requests: number;
  processed_today: number;
  approval_rate: number;
}