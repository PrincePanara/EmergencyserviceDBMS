import React, { useMemo, useState } from 'react';
import { PencilIcon, PlusIcon, Trash2Icon, TruckIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { InlineSelect, Input, Select } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { VehicleStatusBadge } from '../../components/ui/Badge';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';
import { useTeams, useVehicles } from '../../hooks/useOperations';
import { vehicleService } from '../../services/vehicleService';
import type { Vehicle, VehicleStatus, VehicleType } from '../../types';
import { indexById } from '../../utils/lookup';
import { vehicleIcon } from '../../utils/statusTokens';

const vehicleTypes: VehicleType[] = [
'Ambulance',
'Fire Truck',
'Police Vehicle',
'Rescue Vehicle',
'Water Tanker'];

const vehicleStatuses: VehicleStatus[] = ['Available', 'Dispatched', 'Maintenance', 'Unavailable'];

const emptyForm = {
  number: '',
  type: 'Ambulance' as VehicleType,
  teamId: '',
  status: 'Available' as VehicleStatus,
  capacity: '4'
};

export function AdminVehicles() {
  const vehicles = useVehicles();
  const teams = useTeams();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const teamMap = indexById(teams.data);

  const filtered = useMemo(
    () =>
    (vehicles.data ?? []).filter((vehicle) => {
      const haystack = `${vehicle.number} ${vehicle.type} ${vehicle.status}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (type !== 'all' && vehicle.type !== type) return false;
      if (status !== 'all' && vehicle.status !== status) return false;
      return true;
    }),
    [vehicles.data, query, type, status]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setForm({
      number: vehicle.number,
      type: vehicle.type,
      teamId: vehicle.teamId ?? '',
      status: vehicle.status,
      capacity: String(vehicle.capacity)
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.number.trim()) {
      toast.warning('Missing details', 'Vehicle registration number is required.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        number: form.number,
        type: form.type,
        teamId: form.teamId || undefined,
        status: form.status,
        capacity: Number(form.capacity) || 1
      };
      if (editing) {
        await vehicleService.update(editing.id, payload);
        toast.success('Vehicle updated');
      } else {
        await vehicleService.create(payload);
        toast.success('Vehicle added');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Unable to save vehicle', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await vehicleService.remove(deleting.id);
      toast.success('Vehicle deleted');
      setDeleting(null);
    } catch (err) {
      toast.error('Unable to delete vehicle', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Vehicle Management"
        subtitle="Fleet readiness across ambulances, fire, police, rescue and tanker units."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openCreate}>
            Add vehicle
          </Button>
        } />
      

      <Card>
        <FilterBar
          activeCount={[type, status].filter((v) => v !== 'all').length}
          onReset={() => {
            setType('all');
            setStatus('all');
          }}>
          
          <SearchBar value={query} onChange={setQuery} placeholder="Search vehicle number" className="min-w-[200px]" />
          <InlineSelect
            label="Vehicle type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[{ value: 'all', label: 'All types' }, ...vehicleTypes.map((t) => ({ value: t, label: t }))]} />
          
          <InlineSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[{ value: 'all', label: 'All statuses' }, ...vehicleStatuses.map((s) => ({ value: s, label: s }))]} />
          
        </FilterBar>

        {vehicles.error ?
        <ErrorState inline onRetry={vehicles.reload} /> :
        vehicles.loading ?
        <TableSkeleton rows={5} columns={6} /> :
        filtered.length === 0 ?
        <EmptyState icon={TruckIcon} title="No vehicles found" description="Adjust the filters or register a new vehicle." /> :

        <TableWrap>
            <thead>
              <tr>
                <Th>Vehicle number</Th>
                <Th>Type</Th>
                <Th>Assigned team</Th>
                <Th>Capacity</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => {
              const Icon = vehicleIcon[vehicle.type];
              return (
                <Tr key={vehicle.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-subtle text-muted">
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="font-mono text-[13px] font-semibold">{vehicle.number}</span>
                      </div>
                    </Td>
                    <Td className="text-muted">{vehicle.type}</Td>
                    <Td className="text-muted">
                      {vehicle.teamId ? teamMap[vehicle.teamId]?.name ?? '—' : 'Unassigned'}
                    </Td>
                    <Td>{vehicle.capacity}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <VehicleStatusBadge status={vehicle.status} />
                        <InlineSelect
                        label={`Change status for ${vehicle.number}`}
                        value={vehicle.status}
                        onChange={async (e) => {
                          try {
                            await vehicleService.setStatus(vehicle.id, e.target.value as VehicleStatus);
                            toast.info('Vehicle status updated');
                          } catch {
                            toast.error('Unable to update vehicle status');
                          }
                        }}
                        options={vehicleStatuses.map((s) => ({ value: s, label: s }))}
                        className="h-8 text-[12px]" />
                      
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" icon={PencilIcon} onClick={() => openEdit(vehicle)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2Icon} onClick={() => setDeleting(vehicle)}>
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
        title={editing ? 'Edit vehicle' : 'Add vehicle'}
        icon={TruckIcon}
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={save}>
              {editing ? 'Save changes' : 'Add vehicle'}
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Registration number"
            required
            value={form.number}
            onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
            placeholder="GJ03AB1006" />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Vehicle type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as VehicleType }))}
              options={vehicleTypes.map((t) => ({ value: t, label: t }))} />
            
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as VehicleStatus }))}
              options={vehicleStatuses.map((s) => ({ value: s, label: s }))} />
            
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Assign team"
              placeholder="No team assigned"
              value={form.teamId}
              onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}
              options={(teams.data ?? []).map((t) => ({ value: t.id, label: `${t.name} · ${t.type}` }))} />
            
            <Input
              label="Capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} />
            
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        icon={Trash2Icon}
        title={`Delete ${deleting?.number ?? 'vehicle'}?`}
        description="Dispatched vehicles cannot be deleted until their response completes."
        confirmLabel="Delete vehicle" />
      
    </div>);

}