import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ToastViewport } from '../components/ui/Toast';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  notify: (kind: ToastKind, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let counter = 0;

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, title: string, description?: string) => {
      counter += 1;
      const id = counter;
      setToasts((prev) => [...prev.slice(-2), { id, kind, title, description }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      notify,
      dismiss,
      success: (title, description) => notify('success', title, description),
      error: (title, description) => notify('error', title, description),
      warning: (title, description) => notify('warning', title, description),
      info: (title, description) => notify('info', title, description)
    }),
    [toasts, notify, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>);

}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider.');
  return ctx;
}