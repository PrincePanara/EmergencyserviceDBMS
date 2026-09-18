import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BellIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  MessageSquarePlusIcon,
  PackageIcon,
  TruckIcon,
  UserIcon,
  UsersIcon } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { MapPreview } from '../../components/ui/MapPreview';
import { IncidentTimeline, buildTimelineSteps } from '../../components/ui/Timeline';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { useToast } from '../../contexts/ToastContext';
import { useIncident, useIncidentTimeline, useLocations } from '../../hooks/useIncidents';
import {
  useIncidentAllocations,
  useIncidentNotifications,
  useIncidentResponses,
  useResources,
  useTeams,
  useUsers,
  useVehicles } from
'../../hooks/useOperations';
import { incidentService } from '../../services/incidentService';
import { resourceService } from '../../services/resourceService';
import { responseService } from '../../services/responseService';
import { INCIDENT_STATUSES, type IncidentStatus } from '../../types';
import { formatDateTime, formatMinutes, relativeTime, responseMinutes } from '../../utils/format';
import { indexById } from '../../utils/lookup';

type Dialog = 'team' | 'vehicle' | 'resource' | 'status' | 'note' | 'close' | null;

export function AdminIncidentDetails() {
  const { id } = useParams<{id: string;}>();
  const toast = useToast();
  const incident = useIncident(id);
  const timeline = useIncidentTimeline(id);
  const locations = useLocations();
  const users = useUsers();
  const teams = useTeams();
  const vehicles = useVehicles();
  const resources = useResources();
  const allocations = useIncidentAllocations(id);
  const responses = useIncidentResponses(id);
  const notifications = useIncidentNotifications(id);

  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [nextStatus, setNextStatus] = useState<IncidentStatus>('Dispatched');
  const [note, setNote] = useState('');

  if (incident.loading) return <ListSkeleton rows={4} />;
  if (incident.error || !incident.data) {
    return (
      <ErrorState
        title="Unable to load incident"
        description={incident.error ?? 'This incident record could not be found.'}
        onRetry={incident.reload} />);


  }

  const record = incident.data;
  const reporter = indexById(users.data)[record.userId];
  const location = indexById(locations.data)[record.locationId];
  const team = record.teamId ? indexById(teams.data)[record.teamId] : undefined;
  const vehicle = record.vehicleId ? indexById(vehicles.data)[record.vehicleId] : undefined;
  const resourceMap = indexById(resources.data);
  const response = (responses.data ?? [])[0];
  const selectedResource = resourceMap[resourceId];

  const close = () => setDialog(null);

  const run = async (action: () => Promise<void>, successTitle: string, successBody?: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(successTitle, successBody);
      close();
    } catch (err) {
      toast.error('Action failed', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Incident #${record.code}`}
        subtitle={record.description}
        backTo="/admin/incidents"
        backLabel="Incident queue"
        meta={
        <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
          </span>
        }
        actions={
        <>
            <Button icon={UsersIcon} onClick={() => {setTeamId(record.teamId ?? '');setDialog('team');}}>
              Assign team
            </Button>
            <Button icon={TruckIcon} onClick={() => {setVehicleId(record.vehicleId ?? '');setDialog('vehicle');}}>
              Assign vehicle
            </Button>
            <Button icon={PackageIcon} onClick={() => setDialog('resource')}>
              Allocate resource
            </Button>
            <Button variant="primary" onClick={() => {setNextStatus(record.status);setDialog('status');}}>
              Update status
            </Button>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="Reporter information" icon={UserIcon} />
              <dl className="divide-y divide-line">
                {[
                { label: 'Name', value: reporter?.name ?? '—' },
                { label: 'Phone', value: reporter?.phone ?? '—' },
                { label: 'Email', value: reporter?.email ?? '—' },
                { label: 'City', value: reporter ? `${reporter.city}, ${reporter.state}` : '—' },
                {
                  label: 'Emergency contact',
                  value: record.contactName ? `${record.contactName} · ${record.contactPhone}` : 'Not provided'
                }].
                map((row) =>
                <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <dt className="text-[13px] text-muted">{row.label}</dt>
                    <dd className="text-right text-[13px] font-semibold text-ink">{row.value}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card>
              <CardHeader title="Emergency information" icon={ClipboardListIcon} />
              <dl className="divide-y divide-line">
                {[
                { label: 'Incident ID', value: record.code },
                { label: 'Type', value: record.type },
                { label: 'Priority', value: record.priority },
                { label: 'Status', value: record.status },
                { label: 'Reported', value: formatDateTime(record.reportedAt) },
                { label: 'Closed', value: record.closedAt ? formatDateTime(record.closedAt) : '—' }].
                map((row) =>
                <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <dt className="text-[13px] text-muted">{row.label}</dt>
                    <dd className="text-right text-[13px] font-semibold text-ink">{row.value}</dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Response information"
              icon={UsersIcon}
              actions={
              <>
                  <Button size="sm" icon={MessageSquarePlusIcon} onClick={() => setDialog('note')}>
                    Add note
                  </Button>
                  <Button
                  size="sm"
                  variant="danger"
                  icon={CheckCircle2Icon}
                  disabled={record.status === 'Closed'}
                  onClick={() => setDialog('close')}>
                  
                    Close incident
                  </Button>
                </>
              } />
            
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 sm:grid-cols-3">
              {[
              { label: 'Assigned team', value: team?.name ?? 'Unassigned' },
              { label: 'Team contact', value: team?.contact ?? '—' },
              { label: 'Vehicle', value: vehicle ? `${vehicle.number} · ${vehicle.type}` : 'Unassigned' },
              { label: 'Dispatch time', value: formatDateTime(response?.dispatchTime) },
              { label: 'Arrival time', value: formatDateTime(response?.arrivalTime) },
              {
                label: 'Response time',
                value: formatMinutes(responseMinutes(response?.dispatchTime, response?.arrivalTime))
              }].
              map((row) =>
              <div key={row.label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{row.label}</dt>
                  <dd className="mt-1 text-[13px] font-medium text-ink">{row.value}</dd>
                </div>
              )}
            </dl>
            {response?.notes.length ?
            <ul className="space-y-1.5 border-t border-line px-4 py-3">
                {response.notes.map((entry, i) =>
              <li key={i} className="text-[13px] leading-5 text-ink">
                    • {entry}
                  </li>
              )}
              </ul> :

            <p className="border-t border-line px-4 py-3 text-[13px] text-muted">
                No response notes recorded yet.
              </p>
            }
          </Card>

          <Card>
            <CardHeader
              title="Resource allocation"
              subtitle="Stock committed to this incident"
              icon={PackageIcon}
              actions={
              <Button size="sm" onClick={() => setDialog('resource')}>
                  Allocate
                </Button>
              } />
            
            {(allocations.data ?? []).length === 0 ?
            <EmptyState icon={PackageIcon} title="No resources allocated" description="Allocate equipment or supplies as the response requires." /> :

            <TableWrap>
                <thead>
                  <tr>
                    <Th>Resource</Th>
                    <Th>Allocated</Th>
                    <Th>Returned</Th>
                    <Th>Allocated time</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {(allocations.data ?? []).map((allocation) =>
                <Tr key={allocation.id}>
                      <Td className="font-medium">{resourceMap[allocation.resourceId]?.name ?? allocation.resourceId}</Td>
                      <Td>{allocation.quantity}</Td>
                      <Td>{allocation.returnedQuantity}</Td>
                      <Td className="whitespace-nowrap text-muted">{formatDateTime(allocation.allocatedAt)}</Td>
                      <Td>
                        <Badge tone={allocation.status === 'Allocated' ? 'warning' : 'success'}>
                          {allocation.status}
                        </Badge>
                      </Td>
                    </Tr>
                )}
                </tbody>
              </TableWrap>
            }
          </Card>
        </div>

        <div className="space-y-4">
          {location &&
          <>
              <MapPreview
              address={location.address}
              city={`${location.city}, ${location.state} ${location.pincode}`}
              latitude={location.latitude}
              longitude={location.longitude}
              incidentCode={record.code}
              incidentType={record.type}
              priority={record.priority} />
            
              <Card>
                <CardHeader title="Location information" />
                <dl className="divide-y divide-line">
                  {[
                { label: 'Address', value: location.address },
                { label: 'City', value: location.city },
                { label: 'State', value: location.state },
                { label: 'Pincode', value: location.pincode },
                { label: 'Coordinates', value: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` }].
                map((row) =>
                <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                      <dt className="text-[13px] text-muted">{row.label}</dt>
                      <dd className="text-right text-[13px] font-semibold text-ink">{row.value}</dd>
                    </div>
                )}
                </dl>
              </Card>
            </>
          }

          <Card>
            <CardHeader title="Incident timeline" icon={ClipboardListIcon} />
            <div className="p-4">
              <IncidentTimeline steps={buildTimelineSteps(record.status, timeline.data ?? [])} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Notifications" icon={BellIcon} />
            {(notifications.data ?? []).length === 0 ?
            <EmptyState icon={BellIcon} title="No notifications sent" /> :

            <ul className="divide-y divide-line">
                {(notifications.data ?? []).map((n) =>
              <li key={n.id} className="px-4 py-3">
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
      </div>

      {/* --- Dispatch actions --- */}
      <Modal
        open={dialog === 'team'}
        onClose={close}
        title="Assign response team"
        description="The team is marked Busy and the reporter is notified immediately."
        icon={UsersIcon}
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={close}>Cancel</Button>
            <Button
            variant="primary"
            loading={busy}
            onClick={() =>
            run(
              () => incidentService.assignTeam(record.id, teamId),
              'Team has been dispatched',
              `${indexById(teams.data)[teamId]?.name ?? 'Team'} assigned to ${record.code}.`
            )
            }>
            
              Assign team
            </Button>
          </>
        }>
        
        <Select
          label="Response team"
          required
          placeholder="Select a team"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          options={(teams.data ?? []).map((t) => ({
            value: t.id,
            label: `${t.name} · ${t.type} · ${t.availability}`
          }))} />
        
      </Modal>

      <Modal
        open={dialog === 'vehicle'}
        onClose={close}
        title="Assign vehicle"
        description="Assigned vehicles are marked Dispatched until the response completes."
        icon={TruckIcon}
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={close}>Cancel</Button>
            <Button
            variant="primary"
            loading={busy}
            onClick={() =>
            run(() => incidentService.assignVehicle(record.id, vehicleId), 'Vehicle assigned')
            }>
            
              Assign vehicle
            </Button>
          </>
        }>
        
        <Select
          label="Vehicle"
          required
          placeholder="Select a vehicle"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          options={(vehicles.data ?? []).map((v) => ({
            value: v.id,
            label: `${v.number} · ${v.type} · ${v.status}`
          }))} />
        
      </Modal>

      <Modal
        open={dialog === 'resource'}
        onClose={close}
        title="Allocate resource"
        description="Allocation is blocked when the requested quantity exceeds available stock."
        icon={PackageIcon}
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={close}>Cancel</Button>
            <Button
            variant="primary"
            loading={busy}
            onClick={() =>
            run(
              () => resourceService.allocate(record.id, resourceId, Number(quantity)),
              'Resource allocated',
              `${quantity} × ${selectedResource?.name ?? 'resource'} committed to ${record.code}.`
            )
            }>
            
              Allocate resource
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Select
            label="Resource"
            required
            placeholder="Select a resource"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            options={(resources.data ?? []).map((r) => ({
              value: r.id,
              label: `${r.name} — ${r.quantity} ${r.unit.toLowerCase()} available`
            }))} />
          
          <Input
            label="Quantity required"
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            hint={
            selectedResource ?
            `${selectedResource.quantity} ${selectedResource.unit.toLowerCase()} available · minimum stock ${selectedResource.minimumStock}` :
            'Select a resource to see availability.'
            }
            error={
            selectedResource && Number(quantity) > selectedResource.quantity ?
            `Only ${selectedResource.quantity} available.` :
            undefined
            } />
          
        </div>
      </Modal>

      <Modal
        open={dialog === 'status'}
        onClose={close}
        title={`Update status — ${record.code}`}
        description="Status changes are timestamped and pushed to the reporter."
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={close}>Cancel</Button>
            <Button
            variant="primary"
            loading={busy}
            onClick={() =>
            run(
              () => incidentService.updateStatus(record.id, nextStatus, note.trim() || undefined),
              'Incident status updated successfully.'
            )
            }>
            
              Update status
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Select
            label="New status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as IncidentStatus)}
            options={INCIDENT_STATUSES.map((s) => ({ value: s, label: s }))} />
          
          <Textarea
            label="Status note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Fire contained, cooling operations underway." />
          
        </div>
      </Modal>

      <Modal
        open={dialog === 'note'}
        onClose={close}
        title="Add response note"
        description="Notes are stored against the response record for audit."
        icon={MessageSquarePlusIcon}
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={close}>Cancel</Button>
            <Button
            variant="primary"
            loading={busy}
            onClick={() =>
            run(() => responseService.addIncidentNote(record.id, note.trim()), 'Response note added')
            }>
            
              Save note
            </Button>
          </>
        }>
        
        <Textarea
          label="Note"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Two additional units requested from West Zone depot." />
        
      </Modal>

      <ConfirmDialog
        open={dialog === 'close'}
        onClose={close}
        loading={busy}
        destructive={false}
        icon={CheckCircle2Icon}
        title={`Close ${record.code}?`}
        description="Closing releases the assigned team and vehicle and archives the incident."
        confirmLabel="Close incident"
        onConfirm={() =>
        run(
          () => incidentService.updateStatus(record.id, 'Closed', 'Incident closed by dispatch control.'),
          'Incident closed'
        )
        } />
      
    </div>);

}