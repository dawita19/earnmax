import { UserState, UserAction } from './types';

export const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, isLoading: true, error: null };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        currentUser: action.payload,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'LOGOUT':
      return { ...initialState };

    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };

    case 'UPGRADE_VIP':
      if (!state.currentUser) return state;
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          vipLevel: action.payload.newLevel,
          balance: state.currentUser.balance - action.payload.rechargeAmount,
        },
      };

    case 'UPDATE_BALANCE':
      if (!state.currentUser) return state;
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          balance: state.currentUser.balance + action.payload,
          totalEarnings: state.currentUser.totalEarnings + action.payload,
        },
      };

    case 'ADD_REFERRAL':
      if (!state.currentUser) return state;
      const { level, inviteeId } = action.payload;
      const referralNetwork = { ...state.currentUser.referralNetwork };

      switch (level) {
        case 1:
          referralNetwork.firstLevel = [...referralNetwork.firstLevel, inviteeId];
          break;
        case 2:
          referralNetwork.secondLevel = [...referralNetwork.secondLevel, inviteeId];
          break;
        case 3:
          referralNetwork.thirdLevel = [...referralNetwork.thirdLevel, inviteeId];
          break;
        case 4:
          referralNetwork.fourthLevel = [...referralNetwork.fourthLevel, inviteeId];
          break;
      }

      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          referralNetwork,
        },
      };

    default:
      return state;
  }
};