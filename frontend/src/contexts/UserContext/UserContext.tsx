import React from 'react';
import { UserContextType } from './types';
import { initialState } from './reducers';

export const UserContext = React.createContext<UserContextType>({
  state: initialState,
  dispatch: () => null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  purchaseVIP: async () => {},
  upgradeVIP: async () => {},
  requestWithdrawal: async () => {},
  completeDailyTask: async () => {},
});