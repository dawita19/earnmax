import { useState, useEffect, useCallback } from 'react';
import {
  createPurchaseRequest,
  createUpgradeRequest,
  createWithdrawalRequest,
  getPurchaseRequests,
  getUpgradeRequests,
  getWithdrawalRequests,
  approveRequest,
  rejectRequest,
} from '../services/requestService';
import { useAuth } from './useAuth';
import { useRealTime } from './useRealTime';
import {
  PurchaseRequest,
  UpgradeRequest,
  WithdrawalRequest,
  RequestType,
} from '../types';

export const useRequests = () => {
  const { user, isAdmin } = useAuth();
  const { socket } = useRealTime();
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const [purchases, upgrades, withdrawals] = await Promise.all([
        getPurchaseRequests(),
        getUpgradeRequests(),
        getWithdrawalRequests(),
      ]);
      setPurchaseRequests(purchases);
      setUpgradeRequests(upgrades);
      setWithdrawalRequests(withdrawals);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchRequests();

    if (socket) {
      socket.on('requestUpdate', fetchRequests);
      return () => {
        socket.off('requestUpdate', fetchRequests);
      };
    }
  }, [socket, fetchRequests]);

  const submitPurchaseRequest = async (
    vipLevel: number,
    amount: number,
    paymentProof: File
  ) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const formData = new FormData();
      formData.append('vip_level', vipLevel.toString());
      formData.append('amount', amount.toString());
      formData.append('payment_proof', paymentProof);
      
      const request = await createPurchaseRequest(formData);
      return request;
    } catch (err) {
      throw new Error('Failed to submit purchase request');
    }
  };

  const submitUpgradeRequest = async (
    currentVipLevel: number,
    newVipLevel: number,
    amountDifference: number,
    rechargeAmount: number,
    paymentProof?: File
  ) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const formData = new FormData();
      formData.append('current_vip_level', currentVipLevel.toString());
      formData.append('new_vip_level', newVipLevel.toString());
      formData.append('amount_difference', amountDifference.toString());
      formData.append('recharge_amount', rechargeAmount.toString());
      if (paymentProof) {
        formData.append('payment_proof', paymentProof);
      }
      
      const request = await createUpgradeRequest(formData);
      return request;
    } catch (err) {
      throw new Error('Failed to submit upgrade request');
    }
  };

  const submitWithdrawalRequest = async (
    amount: number,
    paymentMethod: string,
    paymentDetails: string
  ) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const request = await createWithdrawalRequest({
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      });
      return request;
    } catch (err) {
      throw new Error('Failed to submit withdrawal request');
    }
  };

  const handleApproveRequest = async (type: RequestType, requestId: number) => {
    try {
      await approveRequest(type, requestId);
      if (socket) {
        socket.emit('requestApproved', { type, requestId });
      }
    } catch (err) {
      throw new Error(`Failed to approve ${type} request`);
    }
  };

  const handleRejectRequest = async (
    type: RequestType,
    requestId: number,
    reason: string
  ) => {
    try {
      await rejectRequest(type, requestId, reason);
      if (socket) {
        socket.emit('requestRejected', { type, requestId, reason });
      }
    } catch (err) {
      throw new Error(`Failed to reject ${type} request`);
    }
  };

  return {
    purchaseRequests,
    upgradeRequests,
    withdrawalRequests,
    loading,
    error,
    submitPurchaseRequest,
    submitUpgradeRequest,
    submitWithdrawalRequest,
    approveRequest: handleApproveRequest,
    rejectRequest: handleRejectRequest,
    refetchRequests: fetchRequests,
  };
};