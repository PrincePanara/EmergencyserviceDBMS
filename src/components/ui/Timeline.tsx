import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STATUS_FLOW, type IncidentStatus, type IncidentStatusEvent } from '../../types';
import { formatDateTime } from '../../utils/format';

export interface TimelineStep {
  status: IncidentStatus;
  state: 'done' | 'current' | 'pending';
  at?: string;
  note?: string;
  actor?: string;
}

export function buildTimelineSteps(
current: IncidentStatus,
events: IncidentStatusEvent[])
: TimelineStep[] {
  if (current === 'Cancelled') {
    const cancelled = events.find((e) => e.status === 'Cancelled');
    return [
    ...events.
    filter((e) => e.status !== 'Cancelled').
    map<TimelineStep>((e) => ({ status: e.status, state: 'done', at: e.createdAt, note: e.note, actor: e.actor })),
    { status: 'Cancelled', state: 'current', at: cancelled?.createdAt, note: cancelled?.note, actor: cancelled?.actor }];

  }
  const currentIndex = STATUS_FLOW.indexOf(current);
  return STATUS_FLOW.map((status, index) => {
    const event = events.find((e) => e.status === status);
    return {
      status,
      state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending',
      at: event?.createdAt,
      note: event?.note,
      actor: event?.actor
    };
  });
}

/** Vertical timeline used on incident detail screens. */
export function IncidentTimeline({ steps }: {steps: TimelineStep[];}) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={`${step.status}-${index}`} className="flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                  step.state === 'done' && 'border-success bg-success text-white',
                  step.state === 'current' && 'border-primary bg-primary text-white',
                  step.state === 'pending' && 'border-line bg-surface text-muted'
                )}
                aria-hidden>
                
                {step.state === 'done' ?
                <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> :
                step.state === 'current' ?
                <span className="h-2 w-2 rounded-full bg-white" /> :

                index + 1
                }
              </span>
              {!isLast &&
              <span
                className={cn(
                  'mt-1 w-px flex-1',
                  step.state === 'done' ? 'bg-success/40' : 'bg-line'
                )} />

              }
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    step.state === 'pending' ? 'text-muted' : 'text-ink'
                  )}>
                  
                  {step.status}
                </p>
                <p className="text-xs text-muted">
                  {step.at ? formatDateTime(step.at) : 'Pending'}
                  {step.state === 'current' &&
                  <span className="ml-2 font-semibold text-primary">Current</span>
                  }
                </p>
              </div>
              {step.note && <p className="mt-0.5 text-[13px] leading-5 text-muted">{step.note}</p>}
              {step.actor && !step.note &&
              <p className="mt-0.5 text-[13px] text-muted">by {step.actor}</p>
              }
            </div>
          </li>);

      })}
    </ol>);

}

/** Compact horizontal progress used on dashboards and cards. */
export function StatusProgress({ steps }: {steps: TimelineStep[];}) {
  return (
    <ol className="flex w-full items-start gap-0" aria-label="Incident status progress">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.status} className={cn('flex min-w-0 items-start', !isLast && 'flex-1')}>
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border',
                  step.state === 'done' && 'border-success bg-success text-white',
                  step.state === 'current' && 'border-primary bg-primary text-white animate-pulse-ring',
                  step.state === 'pending' && 'border-line bg-surface'
                )}
                aria-hidden>
                
                {step.state === 'done' && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                {step.state === 'current' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span
                className={cn(
                  'max-w-[76px] text-center text-[11px] font-medium leading-tight',
                  step.state === 'pending' ? 'text-muted' : 'text-ink'
                )}>
                
                {step.status}
              </span>
            </div>
            {!isLast &&
            <span
              className={cn(
                'mt-2.5 h-px flex-1',
                step.state === 'done' ? 'bg-success/50' : 'bg-line'
              )}
              aria-hidden />

            }
          </li>);

      })}
    </ol>);

}