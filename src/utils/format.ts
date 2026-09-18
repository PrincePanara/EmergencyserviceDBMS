import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';

export const formatDateTime = (iso?: string): string =>
iso ? format(new Date(iso), 'dd MMM yyyy, hh:mm a') : '—';

export const formatTime = (iso?: string): string =>
iso ? format(new Date(iso), 'hh:mm a') : '—';

export const formatDate = (iso?: string): string =>
iso ? format(new Date(iso), 'dd MMM yyyy') : '—';

export const relativeTime = (iso?: string): string =>
iso ? `${formatDistanceToNow(new Date(iso))} ago` : '—';

/** Response time in whole minutes between dispatch and arrival. */
export const responseMinutes = (dispatch?: string, arrival?: string): number | null => {
  if (!dispatch || !arrival) return null;
  return Math.max(0, differenceInMinutes(new Date(arrival), new Date(dispatch)));
};

export const formatMinutes = (minutes: number | null): string => {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const greeting = (date = new Date()): string => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const initials = (name: string): string =>
name.
replace(/[^a-zA-Z .]/g, '').
split(' ').
filter(Boolean).
slice(0, 2).
map((part) => part[0]?.toUpperCase()).
join('');