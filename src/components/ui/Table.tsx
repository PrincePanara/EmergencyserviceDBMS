import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function TableWrap({ children, className }: {children: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('ers-scroll w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">{children}</table>
    </div>);

}

export function Th({
  children,
  className,
  sortable,
  active,
  direction,
  onSort







}: {children: React.ReactNode;className?: string;sortable?: boolean;active?: boolean;direction?: 'asc' | 'desc';onSort?: () => void;}) {
  return (
    <th
      scope="col"
      aria-sort={active ? direction === 'asc' ? 'ascending' : 'descending' : undefined}
      className={cn(
        'border-b border-line bg-subtle/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted',
        className
      )}>
      
      {sortable ?
      <button
        type="button"
        onClick={onSort}
        className={cn(
          'inline-flex items-center gap-1 transition-colors duration-150 ease-out hover:text-ink',
          active && 'text-ink'
        )}>
        
          {children}
          <span aria-hidden className="text-[10px]">
            {active ? direction === 'asc' ? '▲' : '▼' : '⇅'}
          </span>
        </button> :

      children
      }
    </th>);

}

export function Td({
  children,
  className,
  colSpan




}: {children: React.ReactNode;className?: string;colSpan?: number;}) {
  return (
    <td colSpan={colSpan} className={cn('border-b border-line px-4 py-3 align-middle text-ink', className)}>
      {children}
    </td>);

}

export function Tr({
  children,
  className,
  critical,
  onClick





}: {children: React.ReactNode;className?: string;critical?: boolean;onClick?: () => void;}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors duration-150 ease-out',
        onClick && 'cursor-pointer',
        'hover:bg-subtle/70',
        critical && 'bg-primary-light/60',
        className
      )}>
      
      {children}
    </tr>);

}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  label = 'records'






}: {page: number;pageSize: number;total: number;onPageChange: (page: number) => void;label?: string;}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      
      <p className="text-[13px] text-muted">
        Showing <span className="font-semibold text-ink">{from}</span>–
        <span className="font-semibold text-ink">{to}</span> of{' '}
        <span className="font-semibold text-ink">{total}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors duration-150 ease-out hover:bg-subtle disabled:opacity-40">
          
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        </button>
        {Array.from({ length: pages }).
        map((_, i) => i + 1).
        filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1).
        map((p, idx, arr) =>
        <React.Fragment key={p}>
              {idx > 0 && p - arr[idx - 1] > 1 &&
          <span className="px-1 text-muted" aria-hidden>
                  …
                </span>
          }
              <button
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[13px] font-semibold transition-colors duration-150 ease-out',
              p === page ?
              'border-primary bg-primary-light text-primary-dark' :
              'border-line bg-surface text-muted hover:bg-subtle'
            )}>
            
                {p}
              </button>
            </React.Fragment>
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors duration-150 ease-out hover:bg-subtle disabled:opacity-40">
          
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>);

}