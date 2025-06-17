import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from './AuthProvider';
import { SocketProvider } from './SocketProvider';
import { ThemeProvider } from './ThemeProvider';

type AppContextType = {
  isInitialized: boolean;
  appVersion: string;
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const router = useRouter();

  const appVersion = useMemo(() => process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0', []);

  useEffect(() => {
    const initializeApp = async () => {
      setGlobalLoading(true);
      // Perform any app-wide initialization here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setIsInitialized(true);
      setGlobalLoading(false);
    };

    initializeApp();
  }, []);

  const value = useMemo(() => ({
    isInitialized,
    appVersion,
    globalLoading,
    setGlobalLoading
  }), [isInitialized, appVersion, globalLoading]);

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};