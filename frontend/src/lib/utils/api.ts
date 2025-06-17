// src/lib/utils/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { store } from '@/store'; // Your Redux/Vuex store
import { logout } from '@/store/auth/actions';
import { showErrorToast, showSuccessToast } from '@/lib/utils/notifications';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://api.earnmaxelite.com/v1';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = store.getters['auth/token'];
        if (token) {
          config.headers!.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data?.message) {
          showSuccessToast(response.data.message);
        }
        return response.data;
      },
      (error: AxiosError) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              store.dispatch(logout());
              window.location.href = '/login';
              break;
            case 403:
              showErrorToast('You are not authorized to perform this action');
              break;
            case 500:
              showErrorToast('Server error occurred. Please try again later');
              break;
            default:
              showErrorToast(
                error.response.data?.message || 
                'An error occurred. Please try again'
              );
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  public async uploadFile<T>(url: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Specific API methods for EarnMax Elite
  public async getVipLevels(): Promise<IVipLevel[]> {
    return this.get('/vip-levels');
  }

  public async submitPurchaseRequest(data: IPurchaseRequest): Promise<ITransaction> {
    return this.post('/purchases', data);
  }

  public async submitUpgradeRequest(data: IUpgradeRequest): Promise<ITransaction> {
    return this.post('/upgrades', data);
  }

  public async submitWithdrawalRequest(data: IWithdrawalRequest): Promise<ITransaction> {
    return this.post('/withdrawals', data);
  }

  public async getReferralNetwork(): Promise<IReferralNetwork> {
    return this.get('/referrals/network');
  }

  public async completeDailyTask(taskId: string): Promise<ITaskCompletion> {
    return this.post(`/tasks/${taskId}/complete`);
  }
}

export interface IVipLevel {
  level_id: number;
  investment_amount: number;
  daily_earning: number;
  per_task_earning: number;
  min_withdrawal: number;
  max_total_withdrawal: number;
  investment_area: string;
  daily_tasks: {
    id: string;
    type: string;
    description: string;
    earnings: number;
  }[];
}

export interface IPurchaseRequest {
  vip_level: number;
  payment_proof: string;
  payment_method: string;
}

export interface IUpgradeRequest {
  current_vip_level: number;
  new_vip_level: number;
  recharge_amount: number;
  payment_proof?: string;
}

export interface IWithdrawalRequest {
  amount: number;
  payment_method: string;
  payment_details: string;
}

export interface IReferralNetwork {
  total_invites: number;
  first_level: IReferral[];
  second_level: IReferral[];
  third_level: IReferral[];
  fourth_level: IReferral[];
}

export interface IReferral {
  user_id: string;
  full_name: string;
  join_date: string;
  vip_level: number;
}

export interface ITaskCompletion {
  task_id: string;
  earnings: number;
  completed_at: string;
  next_reset: string;
}

export const apiService = new ApiService();
export default apiService;