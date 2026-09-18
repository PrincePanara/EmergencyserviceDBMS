import React from 'react';
import { SirenIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Brand({
  compact = false,
  subtitle = 'Rajkot District Control',
  className




}: {compact?: boolean;subtitle?: string;className?: string;}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <SirenIcon className="h-5 w-5" aria-hidden />
      </span>
      {!compact &&
      <span className="min-w-0">
          <span className="block truncate text-[15px] font-bold leading-5 tracking-tight text-ink">
            Emergency Response
          </span>
          <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-muted">
            {subtitle}
          </span>
        </span>
      }
    </div>);

}