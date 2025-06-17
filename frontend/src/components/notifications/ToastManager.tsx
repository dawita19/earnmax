import React, { createContext, useContext, useRef, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastMessage {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const showToast = (
    message: string, 
    severity: AlertColor = 'info', 
    duration: number = 6000
  ) => {
    const id = (toastIdRef.current++).toString();
    const newToast = { id, message, severity, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const handleClose = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ 
            marginTop: '60px',
            '& .MuiAlert-root': {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Utility functions for common toast types
export const toast = {
  success: (message: string, duration?: number) => 
    useToast().showToast(message, 'success', duration),
  error: (message: string, duration?: number) => 
    useToast().showToast(message, 'error', duration),
  warning: (message: string, duration?: number) => 
    useToast().showToast(message, 'warning', duration),
  info: (message: string, duration?: number) => 
    useToast().showToast(message, 'info', duration),
};