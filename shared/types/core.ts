// shared/types/core.ts
export interface User {
  user_id: number;
  full_name: string;
  phone_number: string;
  vip_level: number;
  balance: number;
  // ... other fields
}

export interface VIPLevel {
  level_id: number;
  investment_amount: number;
  daily_earning: number;
  // ... other fields
}

// shared/types/requests.ts
export interface PurchaseRequest {
  request_id: number;
  user_id: number;
  vip_level: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}