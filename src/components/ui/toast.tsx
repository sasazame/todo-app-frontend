'use client';

import toast, { Toaster } from 'react-hot-toast';

// Success toast
export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

// Error toast
export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--destructive))',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

// Info toast
export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

// Loading toast
export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

// Dismiss toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Custom Toaster component with proper styling
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '14px',
          maxWidth: '400px',
        },
        success: {
          style: {
            border: '1px solid hsl(var(--success) / 0.5)',
          },
          iconTheme: {
            primary: 'hsl(var(--success))',
            secondary: 'hsl(var(--background))',
          },
        },
        error: {
          style: {
            border: '1px solid hsl(var(--destructive) / 0.5)',
          },
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'hsl(var(--background))',
          },
        },
      }}
    />
  );
}