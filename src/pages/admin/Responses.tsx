import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardListIcon, MessageSquarePlusIcon, PlusIcon, TimerIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Field';
import { SearchBar } from '../../components/ui/Toolbar';
import { Badge } from '../../components/ui/Badge';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';
import { useIncidents } from '../../hooks/useIncidents';
import { useResponses, useTeams, useVehicles } from '../../hooks/useOperations';
import { responseService } from '../../services/responseService';
import type { ResponseRecord } from '../../types';
import { formatDateTime, formatMinutes, responseMinutes } from '../../utils/format';
import { indexById } from '../../utils/lookup';

export function AdminResponses() {
  const responses = useResponses();
  const incidents = useIncidents();
  const teams = useTeams();
  const vehicles = useVehicles();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<ResponseRecord | null>(null);
  const [form, setForm] = useState({ incidentId: '', teamId: '', vehicleId: '', note: '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const incidentMap = indexById(incidents.data);
  const teamMap = indexById(teams.data);
  const vehicleMap = indexById(vehicles.data);
  const rows = responses.data ?? [];

  const filtered = useMemo(
    () =>
    rows.filter((record) => {
      const incident = incidentMap[record.incidentId];
      const haystack = `${record.incidentId} ${incident?.type ?? ''} ${teamMap[record.teamId]?.name ?? ''}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    }),
    [rows, incidentMap, teamMap, query]
  );

  const completed = rows.filter((r) => r.completionTime);
  const withArrival = rows.
  map((r) => responseMinutes(r.dispatchTime, r.arrivalTime)).
  filter((m): m is number => m !== null);
  const avgResponse = withArrival.length ?
  Math.round(withArrival.reduce((a, b) => a + b, 0) / withArrival.length) :
  null;

  const create = async () => {
    if (!form.incidentId || !form.teamId) {
      toast.warning('Missing details', 'Select both an incident and a responding team.');
      return;
    }
    setBusy(true);
    try {
      await responseService.create({
        incidentId: form.incidentId,
        teamId: form.teamId,
        vehicleId: form.vehicleId || undefined,
        note: form.note.trim() || undefined
      });
      toast.success('Response record created');
      setCreateOpen(false);
      setForm({ incidentId: '', teamId: '', vehicleId: '', note: '' });
    } catch {
      toast.error('Unable to create response record');
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!noteTarget || !note.trim()) return;
    setBusy(true);
    try {
      await responseService.addNote(noteTarget.id, note.trim());
      toast.success('Note added to response record');
      setNoteTarget(null);
      setNote('');
    } catch {
      toast.error('Unable to add note');
    } finally {
      setBusy(false);
    }
  };

  const act = async (action: () => Promise<void>, message: string) => {
    try {
      await action();
      toast.success(message);
    } catch {
      toast.error('Unable to update response record');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Response Records"
        subtitle="Dispatch, arrival and completion times for every deployment."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={() => setCreateOpen(true)}>
            Create response
          </Button>
        } />
      

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total responses" value={rows.length} icon={ClipboardListIcon} />
        <StatCard label="Completed" value={completed.length} icon={ClipboardListIcon} tone="success" />
        <StatCard label="In progress" value={rows.length - completed.length} icon={TimerIcon} tone="warning" />
        <StatCard
          label="Average response time"
          value={formatMinutes(avgResponse)}
          icon={TimerIcon}
          hint="Dispatch → arrival" />
        
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by incident, type or team"
            className="max-w-sm" />
          
        </div>

        {responses.error ?
        <ErrorState inline onRetry={responses.reload} /> :
        responses.loading ?
        <TableSkeleton rows={6} columns={8} /> :
        filtered.length === 0 ?
        <EmptyState icon={ClipboardListIcon} title="No response records" description="Assigning a team to an incident creates a response record." /> :

        <TableWrap>
            <thead>
              <tr>
                <Th>Incident</Th>
                <Th>Team</Th>
                <Th>Vehicle</Th>
                <Th>Dispatch</Th>
                <Th>Arrival</Th>
                <Th>Completion</Th>
                <Th>Response time</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
              const incident = incidentMap[record.incidentId];
              const minutes = responseMinutes(record.dispatchTime, record.arrivalTime);
              return (
                <Tr key={record.id}>
                    <Td>
                      <Link
                      to={`/admin/incidents/${record.incidentId}`}
                      className="font-mono text-[12px] font-semibold text-primary hover:text-primary-dark">
                      
                        {record.incidentId}
                      </Link>
                      <p className="text-[12px] text-muted">{incident?.type ?? '—'}</p>
                    </Td>
                    <Td className="max-w-[160px] truncate text-muted">{teamMap[record.teamId]?.name ?? '—'}</Td>
                    <Td className="font-mono text-[12px] text-muted">
                      {record.vehicleId ? vehicleMap[record.vehicleId]?.number ?? '—' : '—'}
                    </Td>
                    <Td className="whitespace-nowrap text-muted">{formatDateTime(record.dispatchTime)}</Td>
                    <Td className="whitespace-nowrap text-muted">{formatDateTime(record.arrivalTime)}</Td>
                    <Td className="whitespace-nowrap text-muted">{formatDateTime(record.completionTime)}</Td>
                    <Td>
                      {minutes === null ?
                    <Badge tone="warning">Awaiting arrival</Badge> :

                    <Badge tone={minutes <= 15 ? 'success' : 'warning'}>{formatMinutes(minutes)}</Badge>
                    }
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        {!record.arrivalTime &&
                      <Button
                        size="sm"
                        onClick={() => act(() => responseService.markArrival(record.id), 'Arrival recorded')}>
                        
                            Mark arrival
                          </Button>
                      }
                        {!record.completionTime &&
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => act(() => responseService.markCompletion(record.id), 'Response completed')}>
                        
                            Complete
                          </Button>
                      }
                        <Button
                        size="sm"
                        icon={MessageSquarePlusIcon}
                        onClick={() => {setNoteTarget(record);setNote('');}}>
                        
                          Note
                        </Button>
                      </div>
                    </Td>
                  </Tr>);

            })}
            </tbody>
          </TableWrap>
        }
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create response record"
        description="Use this when a deployment is coordinated outside the incident queue."
        icon={ClipboardListIcon}
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={create}>
              Create record
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Select
            label="Incident"
            required
            placeholder="Select incident"
            value={form.incidentId}
            onChange={(e) => setForm((p) => ({ ...p, incidentId: e.target.value }))}
            options={(incidents.data ?? []).map((i) => ({ value: i.id, label: `${i.code} · ${i.type}` }))} />
          
          <Select
            label="Responding team"
            required
            placeholder="Select team"
            value={form.teamId}
            onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}
            options={(teams.data ?? []).map((t) => ({ value: t.id, label: `${t.name} · ${t.availability}` }))} />
          
          <Select
            label="Vehicle"
            placeholder="No vehicle"
            value={form.vehicleId}
            onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}
            options={(vehicles.data ?? []).map((v) => ({ value: v.id, label: `${v.number} · ${v.type}` }))} />
          
          <Textarea
            label="Initial note"
            rows={3}
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            placeholder="Unit dispatched from West Zone depot." />
          
        </div>
      </Modal>

      <Modal
        open={Boolean(noteTarget)}
        onClose={() => setNoteTarget(null)}
        title="Add response note"
        size="sm"
        icon={MessageSquarePlusIcon}
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setNoteTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={addNote}>
              Save note
            </Button>
          </>
        }>
        
        <Textarea label="Note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
      </Modal>
    </div>);

}