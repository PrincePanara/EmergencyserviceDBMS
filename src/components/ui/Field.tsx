import React, { useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const controlBase =
'w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 ' +
'transition-colors duration-150 ease-out hover:border-muted/40 focus:border-primary focus:outline-none ' +
'focus:ring-2 focus:ring-primary/20 disabled:bg-subtle disabled:text-muted';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {id: string;describedBy?: string;invalid: boolean;}) => React.ReactNode;
  className?: string;
}

export function Field({ label, hint, error, required, children, className }: FieldShellProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
        {required &&
        <span className="ml-1 text-primary" aria-hidden>
            *
          </span>
        }
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ?
      <p id={`${id}-error`} className="text-xs font-medium text-primary">
          {error}
        </p> :

      hint &&
      <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>

      }
    </div>);

}

export function Input({
  label,
  hint,
  error,
  required,
  className,
  ...rest




}: {label: string;hint?: string;error?: string;} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) =>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        required={required}
        className={cn(controlBase, 'h-10', invalid && 'border-primary focus:border-primary')}
        {...rest} />

      }
    </Field>);

}

export function Textarea({
  label,
  hint,
  error,
  required,
  rows = 4,
  className,
  ...rest




}: {label: string;hint?: string;error?: string;} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) =>
      <textarea
        id={id}
        rows={rows}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        required={required}
        className={cn(controlBase, 'resize-y py-2.5 leading-6', invalid && 'border-primary')}
        {...rest} />

      }
    </Field>);

}

export function Select({
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  className,
  ...rest






}: {label: string;hint?: string;error?: string;options: Array<{value: string;label: string;}>;placeholder?: string;} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) =>
      <div className="relative">
          <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
          className={cn(
            controlBase,
            'h-10 appearance-none pr-9',
            invalid && 'border-primary'
          )}
          {...rest}>
          
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) =>
          <option key={option.value} value={option.value}>
                {option.label}
              </option>
          )}
          </select>
          <ChevronDownIcon
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden />
        
        </div>
      }
    </Field>);

}

/** Compact, unlabelled select used inside filter bars and table toolbars. */
export function InlineSelect({
  label,
  options,
  className,
  ...rest



}: {label: string;options: Array<{value: string;label: string;}>;} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        className={cn(
          'h-9 appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-[13px] font-medium text-ink',
          'transition-colors duration-150 ease-out hover:bg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...rest}>
        
        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
        aria-hidden />
      
    </div>);

}

export function Toggle({
  label,
  description,
  checked,
  onChange





}: {label: string;description?: string;checked: boolean;onChange: (next: boolean) => void;}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-150 ease-out',
          checked ? 'border-primary bg-primary' : 'border-line bg-subtle'
        )}>
        
        <span
          className={cn(
            'absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
          )} />
        
      </button>
    </label>);

}