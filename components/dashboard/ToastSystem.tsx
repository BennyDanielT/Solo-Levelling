'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message });
    },
    [addToast],
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message });
    },
    [addToast],
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, message });
    },
    [addToast],
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, message });
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast component
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const icons = {
    success: CheckCircledIcon,
    error: CrossCircledIcon,
    warning: ExclamationTriangleIcon,
    info: InfoCircledIcon,
  };

  const colors = {
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    warning:
      'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`
      max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border pointer-events-auto ring-1 ring-black ring-opacity-5
      transform transition-all duration-300 ease-in-out
      ${colors[toast.type]}
    `}
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <Icon className='h-6 w-6' />
          </div>
          <div className='ml-3 w-0 flex-1'>
            <p className='text-sm font-medium'>{toast.title}</p>
            {toast.message && (
              <p className='mt-1 text-sm opacity-90'>{toast.message}</p>
            )}
          </div>
          <div className='ml-4 flex-shrink-0 flex'>
            <button
              className='inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1'
              onClick={() => onRemove(toast.id)}
            >
              <Cross2Icon className='h-5 w-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast container component
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className='fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50'>
      <div className='w-full flex flex-col items-center space-y-4 sm:items-end'>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
}

// Achievement notification helper
export function useAchievementToast() {
  const { showSuccess } = useToast();

  const showAchievement = useCallback(
    (achievementName: string, points?: number) => {
      showSuccess(
        `Achievement Unlocked! 🏆`,
        `Congratulations! You earned "${achievementName}"${
          points ? ` (+${points} points)` : ''
        }`,
      );
    },
    [showSuccess],
  );

  return { showAchievement };
}

