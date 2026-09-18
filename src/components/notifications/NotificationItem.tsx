import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircle2Icon,
  InfoIcon,
  SirenIcon } from
'lucide-react';
import { cn } from '../../utils/cn';
import { relativeTime } from '../../utils/format';
import type { AppNotification } from '../../types';

const kindConfig = {
  critical: { icon: SirenIcon, className: 'bg-primary-light text-primary' },
  warning: { icon: AlertTriangleIcon, className: 'bg-warning-light text-warning' },
  success: { icon: CheckCircle2Icon, className: 'bg-success-light text-success' },
  info: { icon: InfoIcon, className: 'bg-info-light text-info' }
} as const;

export function NotificationItem({
  notification,
  incidentHref,
  onMarkRead




}: {notification: AppNotification;incidentHref?: string;onMarkRead?: (id: string) => void;}) {
  const config = kindConfig[notification.kind] ?? { icon: BellIcon, className: 'bg-subtle text-muted' };
  const Icon = config.icon;

  return (
    <li
      className={cn(
        'flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0',
        !notification.read && 'bg-primary-light/40'
      )}>
      
      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.className)}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-sm font-semibold text-ink">
            {notification.title}
            {!notification.read &&
            <>
                <span
                className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle"
                aria-hidden />
              
                <span className="sr-only"> (unread)</span>
              </>
            }
          </h3>
          <time className="shrink-0 text-[11px] text-muted">{relativeTime(notification.createdAt)}</time>
        </div>
        <p className="mt-0.5 text-[13px] leading-5 text-muted">{notification.message}</p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {notification.incidentId && incidentHref &&
          <Link
            to={incidentHref}
            className="font-mono text-[11px] font-semibold text-primary transition-colors duration-150 ease-out hover:text-primary-dark">
            
              {notification.incidentId}
            </Link>
          }
          {!notification.read && onMarkRead &&
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="text-[12px] font-semibold text-muted transition-colors duration-150 ease-out hover:text-ink">
            
              Mark as read
            </button>
          }
        </div>
      </div>
    </li>);

}