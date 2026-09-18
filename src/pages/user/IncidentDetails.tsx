import React from 'react';
import { useParams } from 'react-router-dom';
import {
  BellIcon,
  ClipboardListIcon,
  FileTextIcon,
  MapPinIcon,
  TruckIcon,
  UsersIcon } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { MapPreview } from '../../components/ui/MapPreview';
import { IncidentTimeline, buildTimelineSteps } from '../../components/ui/Timeline';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States';
import { useIncident, useIncidentTimeline, useLocations } from '../../hooks/useIncidents';
import {
  useIncidentNotifications,
  useIncidentResponses,
  useTeams,
  useVehicles } from
'../../hooks/useOperations';
import { formatDateTime, formatMinutes, relativeTime, responseMinutes } from '../../utils/format';
import { indexById } from '../../utils/lookup';

export function UserIncidentDetails() {
  const { id } = useParams<{id: string;}>();
  const incident = useIncident(id);
  const timeline = useIncidentTimeline(id);
  const locations = useLocations();
  const teams = useTeams();
  const vehicles = useVehicles();
  const responses = useIncidentResponses(id);
  const notifications = useIncidentNotifications(id);

  if (incident.loading) {
    return (
      <div className="space-y-4">
        <ListSkeleton rows={3} />
      </div>);

  }

  if (incident.error || !incident.data) {
    return (
      <ErrorState
        title="Unable to load this emergency"
        description={incident.error ?? 'The incident record could not be found.'}
        onRetry={incident.reload} />);


  }

  const record = incident.data;
  const location = indexById(locations.data)[record.locationId];
  const team = record.teamId ? indexById(teams.data)[record.teamId] : undefined;
  const vehicle = record.vehicleId ? indexById(vehicles.data)[record.vehicleId] : undefined;
  const response = (responses.data ?? [])[0];

  return (
    <div>
      <PageHeader
        title={record.type}
        subtitle={record.description}
        backTo="/user/incidents"
        backLabel="My emergencies"
        meta={
        <span className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line bg-subtle px-2 py-0.5 font-mono text-xs font-semibold text-muted">
              {record.code}
            </span>
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
          </span>
        } />
      

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Emergency information" icon={FileTextIcon} />
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
              {[
              { label: 'Incident ID', value: record.code },
              { label: 'Emergency type', value: record.type },
              { label: 'Priority', value: record.priority },
              { label: 'Reported time', value: formatDateTime(record.reportedAt) },
              { label: 'Current status', value: record.status },
              { label: 'Emergency contact', value: record.contactName ? `${record.contactName} · ${record.contactPhone}` : 'Not provided' }].
              map((row) =>
              <div key={row.label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-[14px] font-medium text-ink">{row.value}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Description
                </dt>
                <dd className="mt-1 text-[14px] leading-6 text-ink">{record.description}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Status timeline" subtitle="Every update recorded against this incident" icon={ClipboardListIcon} />
            <div className="p-4 sm:p-5">
              <IncidentTimeline steps={buildTimelineSteps(record.status, timeline.data ?? [])} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Notifications for this incident" icon={BellIcon} />
            {(notifications.data ?? []).length === 0 ?
            <EmptyState icon={BellIcon} title="No notifications yet" description="Updates from the control room will appear here." /> :

            <ul className="divide-y divide-line">
                {(notifications.data ?? []).map((n) =>
              <li key={n.id} className="px-4 py-3 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                        <p className="mt-0.5 text-[13px] leading-5 text-muted">{n.message}</p>
                      </div>
                      <time className="shrink-0 text-[11px] text-muted">{relativeTime(n.createdAt)}</time>
                    </div>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>

        <div className="space-y-4">
          {location &&
          <MapPreview
            address={location.address}
            city={`${location.city}, ${location.state} ${location.pincode}`}
            latitude={location.latitude}
            longitude={location.longitude}
            incidentCode={record.code}
            incidentType={record.type}
            priority={record.priority} />

          }

          <Card>
            <CardHeader title="Response information" icon={UsersIcon} />
            <dl className="divide-y divide-line">
              {[
              { icon: UsersIcon, label: 'Assigned team', value: team ? `${team.name} · ${team.type}` : 'Awaiting assignment' },
              { icon: UsersIcon, label: 'Team contact', value: team?.contact ?? '—' },
              { icon: TruckIcon, label: 'Assigned vehicle', value: vehicle ? `${vehicle.number} · ${vehicle.type}` : 'Not assigned' },
              { icon: MapPinIcon, label: 'Dispatch time', value: formatDateTime(response?.dispatchTime) },
              { icon: MapPinIcon, label: 'Arrival time', value: formatDateTime(response?.arrivalTime) },
              {
                icon: MapPinIcon,
                label: 'Response time',
                value: formatMinutes(responseMinutes(response?.dispatchTime, response?.arrivalTime))
              }].
              map((row) =>
              <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
                  <dt className="text-[13px] text-muted">{row.label}</dt>
                  <dd className="text-right text-[13px] font-semibold text-ink">{row.value}</dd>
                </div>
              )}
            </dl>
            {response?.notes.length ?
            <div className="border-t border-line px-4 py-3 sm:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Response notes
                </p>
                <ul className="mt-2 space-y-1.5">
                  {response.notes.map((note, i) =>
                <li key={i} className="text-[13px] leading-5 text-ink">
                      • {note}
                    </li>
                )}
                </ul>
              </div> :
            null}
          </Card>
        </div>
      </div>
    </div>);

}