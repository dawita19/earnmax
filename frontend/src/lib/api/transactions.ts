import axios from 'axios';
import { PurchaseRequest, UpgradeRequest, WithdrawalRequest, TransactionHistory } from '../../types';

const TRANSACTIONS_API_BASE = process.env.NEXT_PUBLIC_TRANSACTIONS_API_URL || '/api/transactions';

export const TransactionsApi = {
  // VIP Purchases
  initiatePurchase: async (vipLevel: number, paymentProof: File): Promise<PurchaseRequest> => {
    const formData = new FormData();
    formData.append('vipLevel', vipLevel.toString());
    formData.append('paymentProof', paymentProof);

    const { data } = await axios.post(`${TRANSACTIONS_API_BASE}/purchase`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // VIP Upgrades
  initiateUpgrade: async (newVipLevel: number, paymentProof?: File): Promise<UpgradeRequest> => {
    const formData = new FormData();
    formData.append('newVipLevel', newVipLevel.toString());
    if (paymentProof) formData.append('paymentProof', paymentProof);

    const { data } = await axios.post(`${TRANSACTIONS_API_BASE}/upgrade`, formData, {
      headers: { 'Content-Type': paymentProof ? 'multipart/form-data' : 'application/json' }
    });
    return data;
  },

  // Withdrawals
  requestWithdrawal: async (amount: number, paymentMethod: string, paymentDetails: string): Promise<WithdrawalRequest> => {
    const { data } = await axios.post(`${TRANSACTIONS_API_BASE}/withdraw`, {
      amount,
      paymentMethod,
      paymentDetails
    });
    return data;
  },

  // History
  getTransactionHistory: async (type?: 'purchase' | 'upgrade' | 'withdrawal', page = 1, limit = 10): Promise<TransactionHistory[]> => {
    const url = `${TRANSACTIONS_API_BASE}/history?page=${page}&limit=${limit}`;
    const finalUrl = type ? `${url}&type=${type}` : url;
    
    const { data } = await axios.get(finalUrl);
    return data;
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const { data } = await axios.get(`${TRANSACTIONS_API_BASE}/payment-methods`);
    return data;
  },

  updatePaymentMethod: async (methodData: any) => {
    const { data } = await axios.put(`${TRANSACTIONS_API_BASE}/payment-method`, methodData);
    return data;
  }
};