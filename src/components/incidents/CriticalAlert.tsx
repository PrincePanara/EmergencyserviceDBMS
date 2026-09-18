import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowRightIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { formatTime } from '../../utils/format';
import type { Incident, LocationRecord, Team } from '../../types';

/**
 * High-urgency banner for critical incidents. Strong hierarchy, single red
 * surface — no flashing or full-screen colour.
 */
export function CriticalAlert({
  incident,
  location,
  team,
  href





}: {incident: Incident;location?: LocationRecord;team?: Team;href: string;}) {
  return (
    <article
      role="alert"
      className="overflow-hidden rounded-xl border border-primary/40 bg-surface shadow-card">
      
      <div className="flex items-center gap-2 border-b border-primary/30 bg-primary px-4 py-2">
        <AlertTriangleIcon className="h-4 w-4 text-white" aria-hidden />
        <p className="text-xs font-bold uppercase tracking-wider text-white">Critical emergency</p>
        <p className="ml-auto font-mono text-xs font-semibold text-white/90">{incident.code}</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-7 tracking-tight text-ink">{incident.type}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">
              {location ? `${location.address}, ${location.city}` : 'Location being verified'}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden />
              Reported {formatTime(incident.reportedAt)}
            </span>
            <StatusBadge status={incident.status} />
            {team && <span className="font-medium text-ink">{team.name}</span>}
          </div>
        </div>

        <Link
          to={href}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-dark">
          
          View incident
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>);

}