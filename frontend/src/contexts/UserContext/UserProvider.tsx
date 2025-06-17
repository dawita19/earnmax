import React, { useReducer, useEffect } from 'react';
import { UserContext } from './UserContext';
import { userReducer, initialState } from './reducers';
import { UserAction, User, VIPLevel } from './types';
import api from '../../services/api'; // Your API service

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    // Check for existing session on initial load
    const checkAuthStatus = async () => {
      try {
        dispatch({ type: 'LOGIN_REQUEST' });
        const response = await api.get('/auth/check-session');
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: { phoneOrEmail: string; password: string }) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const response = await api.post('/auth/login', credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    inviteCode?: string;
  }) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const response = await api.post('/auth/register', userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Registration failed' });
      throw error;
    }
  };

  const purchaseVIP = async (level: number, paymentProof: File) => {
    if (!state.currentUser) throw new Error('User not authenticated');

    try {
      const formData = new FormData();
      formData.append('level', level.toString());
      formData.append('paymentProof', paymentProof);

      const response = await api.post('/vip/purchase', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch({ type: 'UPDATE_USER', payload: response.data.updatedUser });
      return response.data;
    } catch (error) {
      console.error('VIP purchase error:', error);
      throw error;
    }
  };

  const upgradeVIP = async (newLevel: number, paymentProof?: File) => {
    if (!state.currentUser) throw new Error('User not authenticated');

    try {
      const formData = new FormData();
      formData.append('newLevel', newLevel.toString());
      if (paymentProof) formData.append('paymentProof', paymentProof);

      const response = await api.post('/vip/upgrade', formData, {
        headers: { 'Content-Type': paymentProof ? 'multipart/form-data' : 'application/json' },
      });

      dispatch({
        type: 'UPGRADE_VIP',
        payload: {
          newLevel: response.data.newVipLevel,
          rechargeAmount: response.data.rechargeAmount,
        },
      });
      return response.data;
    } catch (error) {
      console.error('VIP upgrade error:', error);
      throw error;
    }
  };

  const requestWithdrawal = async (amount: number, paymentMethod: string) => {
    if (!state.currentUser) throw new Error('User not authenticated');

    try {
      const response = await api.post('/transactions/withdraw', {
        amount,
        paymentMethod,
      });

      dispatch({ type: 'UPDATE_USER', payload: response.data.updatedUser });
      return response.data;
    } catch (error) {
      console.error('Withdrawal error:', error);
      throw error;
    }
  };

  const completeDailyTask = async (taskId: string) => {
    if (!state.currentUser) throw new Error('User not authenticated');

    try {
      const response = await api.post('/tasks/complete', { taskId });
      
      // Update user balance and earnings
      dispatch({ type: 'UPDATE_BALANCE', payload: response.data.earnedAmount });
      
      // Update referral network earnings if applicable
      if (response.data.referralBonuses) {
        // This would be handled by the backend and returned in the response
        dispatch({ type: 'UPDATE_USER', payload: response.data.updatedUser });
      }
      
      return response.data;
    } catch (error) {
      console.error('Task completion error:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        register,
        purchaseVIP,
        upgradeVIP,
        requestWithdrawal,
        completeDailyTask,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};