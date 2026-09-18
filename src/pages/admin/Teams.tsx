import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, InlineSelect, Select } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { AvailabilityBadge } from '../../components/ui/Badge';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';
import { useIncidents } from '../../hooks/useIncidents';
import { useTeams, useVehicles } from '../../hooks/useOperations';
import { teamService } from '../../services/teamService';
import type { Availability, Team, TeamType } from '../../types';
import { indexById, isActiveStatus } from '../../utils/lookup';
import { teamIcon } from '../../utils/statusTokens';

const teamTypes: TeamType[] = ['Fire', 'Medical', 'Police', 'Rescue', 'Disaster Management'];
const availabilities: Availability[] = ['Available', 'Busy', 'Offline'];

const emptyForm = {
  name: '',
  type: 'Fire' as TeamType,
  contact: '',
  availability: 'Available' as Availability,
  vehicleId: '',
  memberCount: '6',
  station: ''
};

export function AdminTeams() {
  const teams = useTeams();
  const vehicles = useVehicles();
  const incidents = useIncidents();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [viewing, setViewing] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState<Team | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const vehicleMap = indexById(vehicles.data);
  const activeResponse = (teamId: string) =>
  (incidents.data ?? []).find((i) => i.teamId === teamId && isActiveStatus(i.status));

  const filtered = useMemo(
    () =>
    (teams.data ?? []).filter((team) => {
      const haystack = `${team.name} ${team.type} ${team.contact} ${team.station}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (type !== 'all' && team.type !== type) return false;
      if (availability !== 'all' && team.availability !== availability) return false;
      return true;
    }),
    [teams.data, query, type, availability]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setForm({
      name: team.name,
      type: team.type,
      contact: team.contact,
      availability: team.availability,
      vehicleId: team.vehicleId ?? '',
      memberCount: String(team.memberCount),
      station: team.station
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.contact.trim()) {
      toast.warning('Missing details', 'Team name and contact number are required.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        contact: form.contact.trim(),
        availability: form.availability,
        vehicleId: form.vehicleId || undefined,
        memberCount: Number(form.memberCount) || 1,
        station: form.station.trim() || 'Unassigned station'
      };
      if (editing) {
        await teamService.update(editing.id, payload);
        toast.success('Team updated');
      } else {
        await teamService.create(payload);
        toast.success('Team added');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Unable to save team', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const changeAvailability = async (team: Team, next: Availability) => {
    try {
      await teamService.setAvailability(team.id, next);
      toast.info('Availability updated', `${team.name} is now ${next.toLowerCase()}.`);
    } catch {
      toast.error('Unable to update availability');
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await teamService.remove(deleting.id);
      toast.success('Team deleted');
      setDeleting(null);
    } catch (err) {
      toast.error('Unable to delete team', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle="Response units, their availability and current assignments."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openCreate}>
            Add team
          </Button>
        } />
      

      <Card>
        <FilterBar
          activeCount={[type, availability].filter((v) => v !== 'all').length}
          onReset={() => {
            setType('all');
            setAvailability('all');
          }}>
          
          <SearchBar value={query} onChange={setQuery} placeholder="Search teams" className="min-w-[200px]" />
          <InlineSelect
            label="Team type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[{ value: 'all', label: 'All types' }, ...teamTypes.map((t) => ({ value: t, label: t }))]} />
          
          <InlineSelect
            label="Availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            options={[{ value: 'all', label: 'All availability' }, ...availabilities.map((a) => ({ value: a, label: a }))]} />
          
        </FilterBar>

        {teams.error ?
        <ErrorState inline onRetry={teams.reload} /> :
        teams.loading ?
        <TableSkeleton rows={5} columns={7} /> :
        filtered.length === 0 ?
        <EmptyState icon={UsersIcon} title="No teams found" description="Adjust the filters or add a new response team." /> :

        <TableWrap>
            <thead>
              <tr>
                <Th>Team name</Th>
                <Th>Type</Th>
                <Th>Contact</Th>
                <Th>Availability</Th>
                <Th>Assigned vehicle</Th>
                <Th>Active response</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((team) => {
              const Icon = teamIcon[team.type];
              const active = activeResponse(team.id);
              return (
                <Tr key={team.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-subtle text-muted">
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-[12px] text-muted">
                            {team.station} · {team.memberCount} members
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-muted">{team.type}</Td>
                    <Td className="whitespace-nowrap text-muted">{team.contact}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <AvailabilityBadge availability={team.availability} />
                        <InlineSelect
                        label={`Change availability for ${team.name}`}
                        value={team.availability}
                        onChange={(e) => changeAvailability(team, e.target.value as Availability)}
                        options={availabilities.map((a) => ({ value: a, label: a }))}
                        className="h-8 text-[12px]" />
                      
                      </div>
                    </Td>
                    <Td className="font-mono text-[12px] text-muted">
                      {team.vehicleId ? vehicleMap[team.vehicleId]?.number ?? '—' : '—'}
                    </Td>
                    <Td>
                      {active ?
                    <Link
                      to={`/admin/incidents/${active.id}`}
                      className="font-mono text-[12px] font-semibold text-primary hover:text-primary-dark">
                      
                          {active.code}
                        </Link> :

                    <span className="text-[13px] text-muted">None</span>
                    }
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" onClick={() => setViewing(team)}>
                          View
                        </Button>
                        <Button size="sm" icon={PencilIcon} onClick={() => openEdit(team)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2Icon} onClick={() => setDeleting(team)}>
                          Delete
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
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit team' : 'Add response team'}
        icon={UsersIcon}
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={save}>
              {editing ? 'Save changes' : 'Add team'}
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Team name"
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Rajkot Fire Team 02" />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Team type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as TeamType }))}
              options={teamTypes.map((t) => ({ value: t, label: t }))} />
            
            <Select
              label="Availability"
              value={form.availability}
              onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value as Availability }))}
              options={availabilities.map((a) => ({ value: a, label: a }))} />
            
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Contact number"
              required
              value={form.contact}
              onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
              placeholder="+91 281 244 1106" />
            
            <Input
              label="Members"
              type="number"
              min={1}
              value={form.memberCount}
              onChange={(e) => setForm((p) => ({ ...p, memberCount: e.target.value }))} />
            
          </div>
          <Input
            label="Station"
            value={form.station}
            onChange={(e) => setForm((p) => ({ ...p, station: e.target.value }))}
            placeholder="Central Fire Station" />
          
          <Select
            label="Assigned vehicle"
            placeholder="No vehicle assigned"
            value={form.vehicleId}
            onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}
            options={(vehicles.data ?? []).map((v) => ({ value: v.id, label: `${v.number} · ${v.type}` }))} />
          
        </div>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? 'Team'}
        description={`${viewing?.type} unit · ${viewing?.station}`}
        footer={
        <Button variant="secondary" data-close onClick={() => setViewing(null)}>
            Close
          </Button>
        }>
        
        <dl className="divide-y divide-line">
          {[
          { label: 'Team type', value: viewing?.type },
          { label: 'Contact', value: viewing?.contact },
          { label: 'Availability', value: viewing?.availability },
          { label: 'Members', value: viewing?.memberCount },
          {
            label: 'Assigned vehicle',
            value: viewing?.vehicleId ? vehicleMap[viewing.vehicleId]?.number ?? '—' : 'None'
          },
          {
            label: 'Active response',
            value: viewing ? activeResponse(viewing.id)?.code ?? 'None' : 'None'
          }].
          map((row) =>
          <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-[13px] text-muted">{row.label}</dt>
              <dd className="text-[13px] font-semibold text-ink">{row.value}</dd>
            </div>
          )}
        </dl>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        icon={Trash2Icon}
        title={`Delete ${deleting?.name ?? 'team'}?`}
        description="Teams engaged on an active incident cannot be deleted."
        confirmLabel="Delete team" />
      
    </div>);

}