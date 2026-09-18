import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
  XIcon } from
'lucide-react';
import type { ToastKind, ToastMessage } from '../../contexts/ToastContext';

const config: Record<ToastKind, {icon: typeof InfoIcon;accent: string;iconColor: string;}> = {
  success: { icon: CheckCircle2Icon, accent: 'border-l-success', iconColor: 'text-success' },
  error: { icon: XCircleIcon, accent: 'border-l-primary', iconColor: 'text-primary' },
  warning: { icon: AlertTriangleIcon, accent: 'border-l-warning', iconColor: 'text-warning' },
  info: { icon: InfoIcon, accent: 'border-l-info', iconColor: 'text-info' }
};

export function ToastViewport({
  toasts,
  onDismiss



}: {toasts: ToastMessage[];onDismiss: (id: number) => void;}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, accent, iconColor } = config[toast.kind];
          return (
            <motion.div
              key={toast.id}
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 border-line bg-surface p-3 shadow-pop ${accent}`}>
              
              <Icon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${iconColor}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description &&
                <p className="mt-0.5 text-[13px] leading-5 text-muted">{toast.description}</p>
                }
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-muted transition-colors duration-150 ease-out hover:text-ink">
                
                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>);

        })}
      </AnimatePresence>
    </div>);

}