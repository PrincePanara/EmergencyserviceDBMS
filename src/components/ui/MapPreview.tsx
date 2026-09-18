import React from 'react';
import { ExternalLinkIcon, MapPinIcon, NavigationIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MapPreviewProps {
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  incidentCode?: string;
  incidentType?: string;
  priority?: string;
  height?: number;
  className?: string;
}

/**
 * Schematic location preview. Deliberately abstract — it conveys coordinates and
 * a marker without pretending to be live satellite imagery.
 */
export function MapPreview({
  address,
  city,
  latitude,
  longitude,
  incidentCode,
  incidentType,
  priority,
  height = 200,
  className
}: MapPreviewProps) {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const mapsUrl = hasCoords ?
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}` :
  undefined;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface', className)}>
      <div
        className="relative bg-subtle"
        style={{
          height,
          backgroundImage:
          'linear-gradient(to right, rgb(var(--ers-line)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--ers-line)) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
        role="img"
        aria-label={`Map preview of ${address}${city ? `, ${city}` : ''}`}>
        
        <span
          className="absolute left-0 top-[38%] h-[6px] w-full bg-line/80"
          aria-hidden />
        
        <span className="absolute left-[62%] top-0 h-full w-[6px] bg-line/80" aria-hidden />

        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <span className="absolute -inset-5 rounded-full bg-primary/10" />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-pop">
            <MapPinIcon className="h-4 w-4" />
          </span>
        </span>

        {hasCoords &&
        <span className="absolute bottom-2 left-2 rounded-md border border-line bg-surface/95 px-2 py-1 font-mono text-[11px] text-muted">
            {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
          </span>
        }
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0">
          {incidentCode &&
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {incidentCode}
              {incidentType ? ` · ${incidentType}` : ''}
              {priority ? ` · ${priority}` : ''}
            </p>
          }
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">{address}</p>
          {city && <p className="text-[13px] text-muted">{city}</p>}
        </div>
        {mapsUrl &&
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-subtle">
          
            <NavigationIcon className="h-3.5 w-3.5" aria-hidden />
            Directions
            <ExternalLinkIcon className="h-3 w-3 text-muted" aria-hidden />
          </a>
        }
      </div>
    </div>);

}