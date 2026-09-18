import React from "react";
import { AlertOctagonIcon, RefreshCwIcon, BoxIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Card } from "./Card";
export function Skeleton({
  className,
  style



}: {className?: string;style?: React.CSSProperties;}) {
  return <div style={style} className={cn('animate-pulse rounded-md bg-subtle', className)} />;
}
export function StatSkeleton({
  count = 4


}: {count?: number;}) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({
      length: count
    }).map((_, i) => <div key={i} className="rounded-xl border border-line bg-surface p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-12" />
        </div>)}
    </div>;
}
export function TableSkeleton({
  rows = 6,
  columns = 6



}: {rows?: number;columns?: number;}) {
  return <div className="p-4" aria-busy="true" aria-label="Loading records">
      <div className="space-y-3">
        {Array.from({
        length: rows
      }).map((_, r) => <div key={r} className="flex items-center gap-4">
            {Array.from({
          length: columns
        }).map((__, c) => <Skeleton key={c} className={cn('h-4 flex-1', c === 0 && 'max-w-[90px]', c === columns - 1 && 'max-w-[70px]')} />)}
          </div>)}
      </div>
    </div>;
}
export function ListSkeleton({
  rows = 4


}: {rows?: number;}) {
  return <div className="space-y-3" aria-busy="true">
      {Array.from({
      length: rows
    }).map((_, i) => <div key={i} className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>)}
    </div>;
}
export function ChartSkeleton({
  height = 240


}: {height?: number;}) {
  return <div className="flex items-end gap-2 p-5" style={{
    height
  }} aria-busy="true">
      {[45, 70, 35, 85, 55, 65, 40].map((h, i) => <Skeleton key={i} className="flex-1" style={{
      height: `${h}%`
    }} />)}
    </div>;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className






}: {icon: BoxIcon;title: string;description?: string;action?: React.ReactNode;className?: string;}) {
  return <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-subtle text-muted">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-3 text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>;
}
export function ErrorState({
  title = 'Something went wrong',
  description = 'Unable to load emergency data. Check your connection and try again.',
  onRetry,
  inline = false





}: {title?: string;description?: string;onRetry?: () => void;inline?: boolean;}) {
  const body = <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
        <AlertOctagonIcon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-3 text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted">{description}</p>
      {onRetry && <Button className="mt-4" variant="danger" icon={RefreshCwIcon} onClick={onRetry}>
          Try again
        </Button>}
    </div>;
  return inline ? body : <Card>
      <div role="alert">{body}</div>
    </Card>;
}