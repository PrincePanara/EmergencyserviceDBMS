import React from 'react';
import { cn } from '../../utils/cn';
import {
  availabilityToken,
  priorityToken,
  statusToken,
  vehicleStatusToken } from
'../../utils/statusTokens';
import type {
  Availability,
  IncidentStatus,
  Priority,
  VehicleStatus } from
'../../types';

const base =
'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap';

export function Badge({
  children,
  className,
  tone = 'neutral'




}: {children: React.ReactNode;className?: string;tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'info';}) {
  const tones = {
    neutral: 'bg-subtle text-muted border-line',
    primary: 'bg-primary-light text-primary-dark border-primary/25',
    success: 'bg-success-light text-success border-success/25',
    warning: 'bg-warning-light text-warning border-warning/30',
    info: 'bg-info-light text-info border-info/25'
  } as const;
  return <span className={cn(base, tones[tone], className)}>{children}</span>;
}

export function StatusBadge({ status, className }: {status: IncidentStatus;className?: string;}) {
  const token = statusToken[status];
  return (
    <span className={cn(base, token.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', token.dot)} aria-hidden />
      {token.label}
    </span>);

}

/** Priority never relies on colour alone — the bar count and label both encode it. */
export function PriorityBadge({ priority, className }: {priority: Priority;className?: string;}) {
  const token = priorityToken[priority];
  return (
    <span className={cn(base, token.className, className)}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4].map((bar) =>
        <span
          key={bar}
          className={cn(
            'w-[3px] rounded-sm',
            bar <= token.bars ? token.dot : 'bg-current opacity-25',
            bar === 1 && 'h-1.5',
            bar === 2 && 'h-2',
            bar === 3 && 'h-2.5',
            bar === 4 && 'h-3'
          )} />

        )}
      </span>
      {token.label}
    </span>);

}

export function AvailabilityBadge({ availability }: {availability: Availability;}) {
  const token = availabilityToken[availability];
  return (
    <span className={cn(base, token.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', token.dot)} aria-hidden />
      {availability}
    </span>);

}

export function VehicleStatusBadge({ status }: {status: VehicleStatus;}) {
  const token = vehicleStatusToken[status];
  return (
    <span className={cn(base, token.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', token.dot)} aria-hidden />
      {status}
    </span>);

}