import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SirenIcon, UserPlusIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { InlineSelect, Select, Textarea } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Pagination, TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { useToast } from '../../contexts/ToastContext';
import { useIncidents, useLocations } from '../../hooks/useIncidents';
import { useTeams, useUsers } from '../../hooks/useOperations';
import { incidentService } from '../../services/incidentService';
import {
  EMERGENCY_TYPES,
  INCIDENT_STATUSES,
  PRIORITIES,
  type Incident,
  type IncidentStatus } from
'../../types';
import { formatDateTime } from '../../utils/format';
import { indexById } from '../../utils/lookup';

const PAGE_SIZE = 10;
const priorityRank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export function AdminIncidents() {
  const incidents = useIncidents();
  const locations = useLocations();
  const teams = useTeams();
  const users = useUsers();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [range, setRange] = useState('all');
  const [sort, setSort] = useState<'recent' | 'priority'>('recent');
  const [page, setPage] = useState(1);

  const [assigning, setAssigning] = useState<Incident | null>(null);
  const [statusTarget, setStatusTarget] = useState<Incident | null>(null);
  const [closing, setClosing] = useState<Incident | null>(null);
  const [cancelling, setCancelling] = useState<Incident | null>(null);
  const [teamId, setTeamId] = useState('');
  const [nextStatus, setNextStatus] = useState<IncidentStatus>('Dispatched');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const locationMap = indexById(locations.data);
  const teamMap = indexById(teams.data);
  const userMap = indexById(users.data);
  const cities = [...new Set((locations.data ?? []).map((l) => l.city))];

  const filtered = useMemo(() => {
    const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 24 * 3600_000;
    const list = (incidents.data ?? []).filter((incident) => {
      const location = locationMap[incident.locationId];
      const reporter = userMap[incident.userId];
      const haystack = `${incident.code} ${incident.type} ${incident.status} ${reporter?.name ?? ''} ${location?.address ?? ''}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (type !== 'all' && incident.type !== type) return false;
      if (priority !== 'all' && incident.priority !== priority) return false;
      if (status !== 'all' && incident.status !== status) return false;
      if (city !== 'all' && location?.city !== city) return false;
      if (cutoff && new Date(incident.reportedAt).getTime() < cutoff) return false;
      return true;
    });
    return sort === 'priority' ?
    [...list].sort(
      (a, b) =>
      priorityRank[b.priority] - priorityRank[a.priority] ||
      b.reportedAt.localeCompare(a.reportedAt)
    ) :
    list;
  }, [incidents.data, locationMap, userMap, query, type, priority, status, city, range, sort]);

  const activeFilters = [type, priority, status, city, range].filter((v) => v !== 'all').length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setType('all');
    setPriority('all');
    setStatus('all');
    setCity('all');
    setRange('all');
    setPage(1);
  };

  const runAssign = async () => {
    if (!assigning || !teamId) {
      toast.warning('Select a team', 'Choose the unit that should respond.');
      return;
    }
    setBusy(true);
    try {
      await incidentService.assignTeam(assigning.id, teamId);
      toast.info('Team has been dispatched', `${teamMap[teamId]?.name} assigned to ${assigning.code}.`);
      setAssigning(null);
      setTeamId('');
    } catch (err) {
      toast.error('Unable to assign team', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const runStatus = async () => {
    if (!statusTarget) return;
    setBusy(true);
    try {
      await incidentService.updateStatus(statusTarget.id, nextStatus, note.trim() || undefined);
      toast.success('Incident status updated successfully.');
      setStatusTarget(null);
      setNote('');
    } catch {
      toast.error('Unable to update incident.');
    } finally {
      setBusy(false);
    }
  };

  const runClose = async () => {
    if (!closing) return;
    setBusy(true);
    try {
      await incidentService.updateStatus(closing.id, 'Closed', 'Incident closed by dispatch control.');
      toast.success('Incident closed', `${closing.code} moved to closed.`);
      setClosing(null);
    } catch {
      toast.error('Unable to close incident.');
    } finally {
      setBusy(false);
    }
  };

  const runCancel = async () => {
    if (!cancelling) return;
    setBusy(true);
    try {
      await incidentService.cancel(cancelling.id, 'Cancelled after verification by dispatch control.');
      toast.warning('Incident cancelled', `${cancelling.code} marked as cancelled.`);
      setCancelling(null);
    } catch {
      toast.error('Unable to cancel incident.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Incident Management"
        subtitle="Triage, assign and progress every reported emergency."
        meta={
        <span className="rounded-md border border-line bg-subtle px-2 py-0.5 text-xs font-semibold text-muted">
            {filtered.length} of {(incidents.data ?? []).length} records
          </span>
        } />
      

      <Card>
        <FilterBar activeCount={activeFilters} onReset={resetFilters}>
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search incident ID, reporter, type or location"
            className="min-w-[200px] basis-full xl:basis-auto" />
          
          <InlineSelect
            label="Emergency type"
            value={type}
            onChange={(e) => {setType(e.target.value);setPage(1);}}
            options={[{ value: 'all', label: 'All types' }, ...EMERGENCY_TYPES.map((t) => ({ value: t, label: t }))]} />
          
          <InlineSelect
            label="Priority"
            value={priority}
            onChange={(e) => {setPriority(e.target.value);setPage(1);}}
            options={[{ value: 'all', label: 'All priorities' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]} />
          
          <InlineSelect
            label="Status"
            value={status}
            onChange={(e) => {setStatus(e.target.value);setPage(1);}}
            options={[{ value: 'all', label: 'All statuses' }, ...INCIDENT_STATUSES.map((s) => ({ value: s, label: s }))]} />
          
          <InlineSelect
            label="Location"
            value={city}
            onChange={(e) => {setCity(e.target.value);setPage(1);}}
            options={[{ value: 'all', label: 'All locations' }, ...cities.map((c) => ({ value: c, label: c }))]} />
          
          <InlineSelect
            label="Date range"
            value={range}
            onChange={(e) => {setRange(e.target.value);setPage(1);}}
            options={[
            { value: 'all', label: 'Any date' },
            { value: '1', label: 'Last 24 hours' },
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' }]
            } />
          
          <InlineSelect
            label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'recent' | 'priority')}
            options={[
            { value: 'recent', label: 'Newest first' },
            { value: 'priority', label: 'Highest priority' }]
            }
            className="ml-auto" />
          
        </FilterBar>

        {incidents.error ?
        <ErrorState inline onRetry={incidents.reload} /> :
        incidents.loading ?
        <TableSkeleton rows={8} columns={9} /> :
        filtered.length === 0 ?
        <EmptyState
          icon={SirenIcon}
          title="No incidents found"
          description="No incident matches the current search and filters."
          action={activeFilters ? <Button onClick={resetFilters}>Clear filters</Button> : undefined} /> :


        <>
            <div className="hidden lg:block">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Incident ID</Th>
                    <Th>Reported by</Th>
                    <Th>Type</Th>
                    <Th>Priority</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                    <Th>Reported</Th>
                    <Th>Team</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((incident) =>
                <Tr key={incident.id} critical={incident.priority === 'Critical'}>
                      <Td>
                        <Link
                      to={`/admin/incidents/${incident.id}`}
                      className="font-mono text-[12px] font-semibold text-primary hover:text-primary-dark">
                      
                          {incident.code}
                        </Link>
                      </Td>
                      <Td className="whitespace-nowrap text-muted">
                        {userMap[incident.userId]?.name ?? '—'}
                      </Td>
                      <Td className="font-medium">{incident.type}</Td>
                      <Td>
                        <PriorityBadge priority={incident.priority} />
                      </Td>
                      <Td className="max-w-[180px] truncate text-muted">
                        {locationMap[incident.locationId]?.address ?? '—'}
                      </Td>
                      <Td>
                        <StatusBadge status={incident.status} />
                      </Td>
                      <Td className="whitespace-nowrap text-muted">{formatDateTime(incident.reportedAt)}</Td>
                      <Td className="max-w-[150px] truncate text-muted">
                        {incident.teamId ? teamMap[incident.teamId]?.name ?? '—' : 'Unassigned'}
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                        size="sm"
                        onClick={() => {
                          setAssigning(incident);
                          setTeamId(incident.teamId ?? '');
                        }}>
                        
                            Assign
                          </Button>
                          <Button
                        size="sm"
                        onClick={() => {
                          setStatusTarget(incident);
                          setNextStatus(incident.status);
                        }}>
                        
                            Status
                          </Button>
                          {incident.status === 'Resolved' ?
                      <Button size="sm" variant="danger" onClick={() => setClosing(incident)}>
                              Close
                            </Button> :

                      <Button size="sm" variant="ghost" onClick={() => setCancelling(incident)}>
                              Cancel
                            </Button>
                      }
                        </div>
                      </Td>
                    </Tr>
                )}
                </tbody>
              </TableWrap>
            </div>

            <div className="space-y-3 p-3 lg:hidden">
              {paged.map((incident) =>
            <IncidentCard
              key={incident.id}
              incident={incident}
              location={locationMap[incident.locationId]}
              team={incident.teamId ? teamMap[incident.teamId] : undefined}
              to={`/admin/incidents/${incident.id}`} />

            )}
            </div>

            <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            label="incidents" />
          
          </>
        }
      </Card>

      <Modal
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
        title={`Assign team to ${assigning?.code ?? ''}`}
        description="Assigning a team moves the incident to Dispatched and opens a response record."
        icon={UserPlusIcon}
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setAssigning(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={runAssign}>
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
          options={(teams.data ?? []).map((team) => ({
            value: team.id,
            label: `${team.name} · ${team.type} · ${team.availability}`
          }))}
          hint="Teams marked Offline cannot respond immediately." />
        
      </Modal>

      <Modal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={`Update status — ${statusTarget?.code ?? ''}`}
        description="The reporter is notified automatically for every status change."
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={runStatus}>
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
            label="Note for the reporter"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Team is 5 minutes away from the location." />
          
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(closing)}
        onClose={() => setClosing(null)}
        onConfirm={runClose}
        loading={busy}
        destructive={false}
        title={`Close ${closing?.code ?? 'incident'}?`}
        description="Closing archives the incident and releases the assigned team and vehicle."
        confirmLabel="Close incident" />
      

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={runCancel}
        loading={busy}
        title={`Cancel ${cancelling?.code ?? 'incident'}?`}
        description="Use this only for duplicate or unverified reports. The reporter will be notified."
        confirmLabel="Cancel incident" />
      
    </div>);

}