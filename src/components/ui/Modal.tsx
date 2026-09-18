import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon, BoxIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: BoxIcon;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
} as const;
export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')?.focus();
    }, 60);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  return <AnimatePresence>
      {open && <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-ink/45" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.16,
        ease: 'easeOut'
      }} onClick={onClose} />
          <motion.div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} initial={{
        opacity: 0,
        scale: 0.97,
        y: 12
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.98,
        y: 8
      }} transition={{
        duration: 0.2,
        ease: [0.23, 1, 0.32, 1]
      }} className={cn('relative z-10 w-full rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-xl', sizes[size])}>
            <div className="flex items-start gap-3 border-b border-line px-5 py-4">
              {Icon && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>}
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold leading-6 text-ink">{title}</h2>
                {description && <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>}
              </div>
              <button type="button" data-close onClick={onClose} aria-label="Close dialog" className="rounded-md p-1 text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink">
                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {children && <div className="ers-scroll max-h-[min(60vh,520px)] overflow-y-auto px-5 py-4">
                {children}
              </div>}
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">
                {footer}
              </div>}
          </motion.div>
        </div>}
    </AnimatePresence>;
}
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  icon,
  children












}: {open: boolean;onClose: () => void;onConfirm: () => void;title: string;description?: string;confirmLabel?: string;cancelLabel?: string;destructive?: boolean;loading?: boolean;icon?: BoxIcon;children?: React.ReactNode;}) {
  return <Modal open={open} onClose={onClose} title={title} description={description} icon={icon} size="sm" footer={<>
          <Button variant="secondary" onClick={onClose} data-close>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'primary' : 'success'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>}>
      {children}
    </Modal>;
}