import React from "react";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
export function Card({
  children,
  className,
  as: Tag = 'section'




}: {children: React.ReactNode;className?: string;as?: 'section' | 'div' | 'article' | 'aside';}) {
  return <Tag className={cn('rounded-xl border border-line bg-surface shadow-card', className)}>
      {children}
    </Tag>;
}
export function CardHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
  className






}: {title: string;subtitle?: string;actions?: React.ReactNode;icon?: BoxIcon;className?: string;}) {
  return <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5', className)}>
      <div className="flex items-start gap-2.5">
        {Icon && <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subtle text-muted">
            <Icon className="h-4 w-4" aria-hidden />
          </span>}
        <div>
          <h2 className="text-[17px] font-semibold leading-6 text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>;
}
export interface StatCardProps {
  label: string;
  value: string | number;
  icon: BoxIcon;
  hint?: string;
  tone?: 'neutral' | 'critical' | 'success' | 'warning' | 'info';
  onClick?: () => void;
}
const tones = {
  neutral: {
    icon: 'bg-subtle text-muted',
    value: 'text-ink',
    ring: 'border-line'
  },
  critical: {
    icon: 'bg-primary-light text-primary',
    value: 'text-primary',
    ring: 'border-primary/35'
  },
  success: {
    icon: 'bg-success-light text-success',
    value: 'text-ink',
    ring: 'border-line'
  },
  warning: {
    icon: 'bg-warning-light text-warning',
    value: 'text-ink',
    ring: 'border-line'
  },
  info: {
    icon: 'bg-info-light text-info',
    value: 'text-ink',
    ring: 'border-line'
  }
} as const;
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'neutral',
  onClick
}: StatCardProps) {
  const token = tones[tone];
  const Tag = onClick ? 'button' : 'div';
  return <Tag {...onClick ? {
    type: 'button' as const,
    onClick
  } : {}} className={cn('flex w-full items-start justify-between gap-3 rounded-xl border bg-surface p-4 text-left shadow-card', token.ring, onClick && 'transition-colors duration-150 ease-out hover:bg-subtle')}>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-muted">{label}</p>
        <p className={cn('mt-1 text-2xl font-bold leading-none tracking-tight', token.value)}>
          {value}
        </p>
        {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      </div>
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', token.icon)}>
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
    </Tag>;
}