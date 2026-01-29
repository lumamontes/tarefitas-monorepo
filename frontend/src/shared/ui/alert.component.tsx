/**
 * Alert dialog component
 * Calm confirmation dialogs
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface AlertOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AlertContextValue {
  show: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const show = (options: AlertOptions) => {
    setAlert(options);
  };

  // Set global alert function
  globalAlertShow = show;

  const handleConfirm = () => {
    if (alert) {
      alert.onConfirm();
      setAlert(null);
    }
  };

  const handleCancel = () => {
    if (alert) {
      alert.onCancel?.();
      setAlert(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      {alert && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-title"
          aria-describedby="alert-message"
        >
          <div className="bg-theme-panel rounded-xl border border-theme-border p-6 max-w-md w-full shadow-xl">
            <h2 id="alert-title" className="text-lg font-semibold text-theme-text mb-2">
              {alert.title}
            </h2>
            <p id="alert-message" className="text-sm text-theme-muted mb-6">
              {alert.message}
            </p>
            <div className="flex gap-3 justify-end">
              {alert.showCancel && (
                <button
                  className="px-4 py-2 rounded-lg border border-theme-border bg-theme-panel text-theme-text hover:bg-theme-sidebar transition-colors"
                  onClick={handleCancel}
                >
                  {alert.cancelLabel ?? 'Cancel'}
                </button>
              )}
              <button
                className="px-4 py-2 rounded-lg bg-theme-accent text-white hover:opacity-90 transition-opacity"
                onClick={handleConfirm}
                autoFocus
              >
                {alert.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

// Global alert instance (will be set by provider)
let globalAlertShow: ((options: AlertOptions) => void) | null = null;

export const alert = {
  confirm: (message: string, onConfirm: () => void, options?: Partial<AlertOptions>) => {
    if (globalAlertShow) {
      globalAlertShow({
        title: options?.title || 'Confirm',
        message,
        onConfirm,
        showCancel: true,
        ...options,
      });
    } else {
      console.warn('AlertProvider not found');
    }
  },
  show: (options: AlertOptions) => {
    if (globalAlertShow) {
      globalAlertShow(options);
    } else {
      console.warn('AlertProvider not found');
    }
  },
};

// Export Alert component for backward compatibility
export function Alert() {
  return null; // Actual implementation is in AlertProvider
}

// Hook to set global alert function
export function useSetAlert() {
  const context = useContext(AlertContext);
  if (context) {
    globalAlertShow = context.show;
  }
  return context;
}
