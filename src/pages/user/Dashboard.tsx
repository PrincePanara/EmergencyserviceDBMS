import React from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowRightIcon,
  BellIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  MapPinIcon,
  SirenIcon,
  TruckIcon,
  UsersIcon } from
'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, ListSkeleton, StatSkeleton } from '../../components/ui/States';
import { Td, TableWrap, Th, Tr } from '../../components/ui/Table';
import { StatusProgress, buildTimelineSteps } from '../../components/ui/Timeline';
import { useAuth } from '../../contexts/AuthContext';
import { useIncidentTimeline, useLocations, useUserIncidents } from '../../hooks/useIncidents';
import { useNotifications, useTeams } from '../../hooks/useOperations';
import { formatDateTime, formatTime, greeting } from '../../utils/format';
import { indexById, isActiveStatus } from '../../utils/lookup';

export function UserDashboard() {
  const { user } = useAuth();
  const incidents = useUserIncidents(user?.id);
  const locations = useLocations();
  const teams = useTeams();
  const notifications = useNotifications(user?.id);

  const rows = incidents.data ?? [];
  const locationMap = indexById(locations.data);
  const teamMap = indexById(teams.data);

  const active = rows.filter((i) => isActiveStatus(i.status));
  const resolved = rows.filter((i) => i.status === 'Resolved' || i.status === 'Closed');
  const focus = active[0];
  const timeline = useIncidentTimeline(focus?.id);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[22px] font-bold leading-7 tracking-tight text-ink">
            {greeting()}, {user?.name.split(' ')[0]}
          </h2>
          <p className="mt-1 text-sm text-muted">Stay informed. Stay safe.</p>
        </div>
        <Link
          to="/user/report-emergency"
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-base font-bold tracking-wide text-white transition-colors duration-150 ease-out hover:bg-primary-dark focus-visible:outline-offset-4">
          
          <SirenIcon className="h-5 w-5" aria-hidden />
          REPORT EMERGENCY
        </Link>
      </section>

      {incidents.loading ?
      <StatSkeleton count={3} /> :

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Your emergency statistics">
          <StatCard
          label="Active emergencies"
          value={active.length}
          icon={ActivityIcon}
          tone={active.length ? 'critical' : 'neutral'}
          hint={active.length ? 'Response in progress' : 'Nothing open right now'} />
        
          <StatCard label="Resolved emergencies" value={resolved.length} icon={CheckCircle2Icon} tone="success" />
          <StatCard label="Total reports" value={rows.length} icon={ClipboardListIcon} />
        </section>
      }

      {incidents.error ?
      <ErrorState onRetry={incidents.reload} /> :
      incidents.loading ?
      <ListSkeleton rows={2} /> :
      focus ?
      <Card>
          <CardHeader
          title="Active emergency"
          subtitle="Live status of your most recent open report"
          icon={SirenIcon}
          actions={
          <Link to={`/user/incidents/${focus.id}`}>
                <Button size="sm" iconRight={ArrowRightIcon}>
                  View details
                </Button>
              </Link>
          } />
        
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {focus.code}
                </p>
                <h3 className="mt-0.5 text-lg font-semibold text-ink">{focus.type}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={focus.priority} />
                <StatusBadge status={focus.status} />
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
            {
              icon: MapPinIcon,
              label: 'Location',
              value: locationMap[focus.locationId] ?
              `${locationMap[focus.locationId].address}, ${locationMap[focus.locationId].city}` :
              '—'
            },
            { icon: ClockIcon, label: 'Reported', value: formatDateTime(focus.reportedAt) },
            {
              icon: UsersIcon,
              label: 'Assigned team',
              value: focus.teamId ? teamMap[focus.teamId]?.name ?? '—' : 'Awaiting assignment'
            },
            {
              icon: TruckIcon,
              label: 'Vehicle',
              value: focus.vehicleId ? focus.vehicleId : 'Not yet assigned'
            }].
            map((item) =>
            <div key={item.label}>
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <item.icon className="h-3.5 w-3.5" aria-hidden />
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-[13px] font-medium leading-5 text-ink">{item.value}</dd>
                </div>
            )}
            </dl>

            <div className="ers-scroll mt-5 overflow-x-auto border-t border-line pt-5">
              <div className="min-w-[520px]">
                <StatusProgress steps={buildTimelineSteps(focus.status, timeline.data ?? [])} />
              </div>
            </div>
          </div>
        </Card> :

      <Card>
          <EmptyState
          icon={CheckCircle2Icon}
          title="No active emergencies"
          description="You have no open reports. If something happens, reporting takes less than a minute."
          action={
          <Link to="/user/report-emergency">
                <Button variant="primary" icon={SirenIcon}>
                  Report emergency
                </Button>
              </Link>
          } />
        
        </Card>
      }

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Recent emergency reports"
            subtitle="Your last reports and their outcome"
            actions={
            <Link to="/user/incidents">
                <Button size="sm" iconRight={ArrowRightIcon}>
                  All reports
                </Button>
              </Link>
            } />
          
          {rows.length === 0 ?
          <EmptyState
            icon={ClipboardListIcon}
            title="No emergency reports available"
            description="Reports you submit will be listed here with their live status." /> :


          <TableWrap>
              <thead>
                <tr>
                  <Th>Incident ID</Th>
                  <Th>Type</Th>
                  <Th>Priority</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 6).map((incident) =>
              <Tr key={incident.id} critical={incident.priority === 'Critical'}>
                    <Td className="font-mono text-[12px] font-semibold">{incident.code}</Td>
                    <Td className="font-medium">{incident.type}</Td>
                    <Td>
                      <PriorityBadge priority={incident.priority} />
                    </Td>
                    <Td className="max-w-[200px] truncate text-muted">
                      {locationMap[incident.locationId]?.address ?? '—'}
                    </Td>
                    <Td>
                      <StatusBadge status={incident.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-muted">{formatDateTime(incident.reportedAt)}</Td>
                    <Td className="text-right">
                      <Link
                    to={`/user/incidents/${incident.id}`}
                    className="text-[13px] font-semibold text-primary hover:text-primary-dark">
                    
                        View
                      </Link>
                    </Td>
                  </Tr>
              )}
              </tbody>
            </TableWrap>
          }
        </Card>

        <Card>
          <CardHeader
            title="Notifications"
            icon={BellIcon}
            actions={
            <Link to="/user/notifications">
                <Button size="sm">Open</Button>
              </Link>
            } />
          
          {(notifications.data ?? []).length === 0 ?
          <EmptyState icon={BellIcon} title="No notifications yet" /> :

          <ul className="divide-y divide-line">
              {(notifications.data ?? []).slice(0, 5).map((n) =>
            <li key={n.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    {!n.read &&
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                }
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted">{formatTime(n.createdAt)}</p>
                    </div>
                  </div>
                </li>
            )}
            </ul>
          }
        </Card>
      </div>
    </div>);

}