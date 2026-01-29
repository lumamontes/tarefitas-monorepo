/**
 * Toast notification component
 * Calm, dismissible feedback
 */

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastListeners: Array<(toasts: ToastMessage[]) => void> = [];
let toasts: ToastMessage[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

function addToast(message: Omit<ToastMessage, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { ...message, id };
  toasts = [...toasts, newToast];
  notifyListeners();

  const duration = message.duration ?? 3000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

export const toast = {
  success: (message: string, duration?: number) => addToast({ type: 'success', message, duration }),
  error: (message: string, duration?: number) => addToast({ type: 'error', message, duration }),
  info: (message: string, duration?: number) => addToast({ type: 'info', message, duration }),
  warning: (message: string, duration?: number) => addToast({ type: 'warning', message, duration }),
};

export function Toast() {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => {
      setCurrentToasts(newToasts);
    };
    toastListeners.push(listener);
    setCurrentToasts([...toasts]);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" role="region" aria-label="Notifications">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${typeClasses[toast.type]}`}
          role="alert"
          aria-live="polite"
        >
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:opacity-70 transition-opacity"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
