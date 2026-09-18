import React from 'react';
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className






}: {value: string;onChange: (value: string) => void;placeholder?: string;label?: string;className?: string;}) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden />
      
      <input
        type="search"
        value={value}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-sm text-ink placeholder:text-muted/70 transition-colors duration-150 ease-out focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      
      {value &&
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition-colors duration-150 ease-out hover:text-ink">
        
          <XIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
      }
    </div>);

}

export function FilterBar({
  children,
  activeCount = 0,
  onReset,
  className





}: {children: React.ReactNode;activeCount?: number;onReset?: () => void;className?: string;}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b border-line px-4 py-3',
        className
      )}>
      
      {children}
      {activeCount > 0 && onReset &&
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-light px-3 text-[13px] font-semibold text-primary-dark transition-colors duration-150 ease-out hover:bg-primary-light/70">
        
          <SlidersHorizontalIcon className="h-3.5 w-3.5" aria-hidden />
          Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
        </button>
      }
    </div>);

}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label





}: {options: Array<{value: T;label: string;}>;value: T;onChange: (value: T) => void;label: string;}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-lg border border-line bg-subtle p-0.5">
      
      {options.map((option) =>
      <button
        key={option.value}
        role="tab"
        type="button"
        aria-selected={value === option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          'rounded-[7px] px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150 ease-out',
          value === option.value ?
          'bg-surface text-ink shadow-sm' :
          'text-muted hover:text-ink'
        )}>
        
          {option.label}
        </button>
      )}
    </div>);

}