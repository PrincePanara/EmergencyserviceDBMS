import React from 'react';
import { ChevronLeftIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
  backLabel = 'Back',
  meta







}: {title: string;subtitle?: string;actions?: React.ReactNode;backTo?: string;backLabel?: string;meta?: React.ReactNode;}) {
  return (
    <header className="mb-5">
      {backTo &&
      <Link
        to={backTo}
        className="mb-2 inline-flex items-center gap-1 text-[13px] font-semibold text-muted transition-colors duration-150 ease-out hover:text-primary">
        
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      }
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold leading-8 tracking-tight text-ink sm:text-[28px]">
              {title}
            </h1>
            {meta}
          </div>
          {subtitle && <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>);

}