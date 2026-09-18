import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { emergencyIcon } from '../../utils/statusTokens';
import { formatDateTime } from '../../utils/format';
import { cn } from '../../utils/cn';
import type { Incident, LocationRecord, Team } from '../../types';

export function IncidentCard({
  incident,
  location,
  team,
  to





}: {incident: Incident;location?: LocationRecord;team?: Team;to: string;}) {
  const Icon = emergencyIcon[incident.type];
  const critical = incident.priority === 'Critical';

  return (
    <Link
      to={to}
      className={cn(
        'block rounded-xl border bg-surface p-4 shadow-card transition-colors duration-150 ease-out hover:bg-subtle/60',
        critical ? 'border-primary/35' : 'border-line'
      )}>
      
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            critical ? 'bg-primary-light text-primary' : 'bg-subtle text-muted'
          )}>
          
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                {incident.code}
              </p>
              <h3 className="truncate text-[15px] font-semibold text-ink">{incident.type}</h3>
            </div>
            <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>

          <dl className="mt-3 space-y-1.5 text-[13px] text-muted">
            <div className="flex items-start gap-1.5">
              <dt className="sr-only">Location</dt>
              <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd className="min-w-0 truncate">
                {location ? `${location.address}, ${location.city}` : 'Location pending'}
              </dd>
            </div>
            <div className="flex items-start gap-1.5">
              <dt className="sr-only">Reported</dt>
              <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd>{formatDateTime(incident.reportedAt)}</dd>
            </div>
            <div className="flex items-start gap-1.5">
              <dt className="sr-only">Assigned team</dt>
              <UsersIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <dd className="min-w-0 truncate">{team ? team.name : 'Awaiting team assignment'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Link>);

}