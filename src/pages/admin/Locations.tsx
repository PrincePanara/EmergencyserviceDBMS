import React, { useMemo, useState } from 'react';
import { MapIcon, MapPinIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { MapPreview } from '../../components/ui/MapPreview';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';
import { useIncidents, useLocations } from '../../hooks/useIncidents';
import { locationService } from '../../services/locationService';
import type { LocationRecord } from '../../types';

const emptyForm = {
  address: '',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '',
  latitude: '',
  longitude: ''
};

export function AdminLocations() {
  const locations = useLocations();
  const incidents = useIncidents();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LocationRecord | null>(null);
  const [viewing, setViewing] = useState<LocationRecord | null>(null);
  const [deleting, setDeleting] = useState<LocationRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
    (locations.data ?? []).filter((location) => {
      const haystack = `${location.address} ${location.city} ${location.state} ${location.pincode}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    }),
    [locations.data, query]
  );

  const incidentCount = (locationId: string) =>
  (incidents.data ?? []).filter((i) => i.locationId === locationId).length;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (location: LocationRecord) => {
    setEditing(location);
    setForm({
      address: location.address,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      latitude: String(location.latitude),
      longitude: String(location.longitude)
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.address.trim() || !form.city.trim()) {
      toast.warning('Missing details', 'Address and city are required.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        latitude: Number(form.latitude) || 22.3039,
        longitude: Number(form.longitude) || 70.8022
      };
      if (editing) {
        await locationService.update(editing.id, payload);
        toast.success('Location updated');
      } else {
        await locationService.create(payload);
        toast.success('Location added');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Unable to save location', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await locationService.remove(deleting.id);
      toast.success('Location deleted');
      setDeleting(null);
    } catch (err) {
      toast.error('Unable to delete location', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Location Management"
        subtitle="Addresses and coordinates referenced by incident records."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openCreate}>
            Add location
          </Button>
        } />
      

      <Card>
        <FilterBar>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search address, city or pincode"
            className="min-w-[200px]" />
          
        </FilterBar>

        {locations.error ?
        <ErrorState inline onRetry={locations.reload} /> :
        locations.loading ?
        <TableSkeleton rows={5} columns={6} /> :
        filtered.length === 0 ?
        <EmptyState icon={MapPinIcon} title="No locations found" description="Add a location or adjust your search." /> :

        <TableWrap>
            <thead>
              <tr>
                <Th>Address</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Pincode</Th>
                <Th>Coordinates</Th>
                <Th>Incidents</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((location) =>
            <Tr key={location.id}>
                  <Td className="max-w-[260px] truncate font-medium">{location.address}</Td>
                  <Td className="text-muted">{location.city}</Td>
                  <Td className="text-muted">{location.state}</Td>
                  <Td className="text-muted">{location.pincode}</Td>
                  <Td className="whitespace-nowrap font-mono text-[12px] text-muted">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Td>
                  <Td>{incidentCount(location.id)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" icon={MapIcon} onClick={() => setViewing(location)}>
                        Map
                      </Button>
                      <Button size="sm" icon={PencilIcon} onClick={() => openEdit(location)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" icon={Trash2Icon} onClick={() => setDeleting(location)}>
                        Delete
                      </Button>
                    </div>
                  </Td>
                </Tr>
            )}
            </tbody>
          </TableWrap>
        }
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit location' : 'Add location'}
        icon={MapPinIcon}
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={save}>
              {editing ? 'Save changes' : 'Add location'}
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Address"
            required
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="Kalawad Road, near Crystal Mall" />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="City" required value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
            <Input label="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
            <Input label="Pincode" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude" value={form.latitude} onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))} />
            <Input label="Longitude" value={form.longitude} onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.address ?? 'Location'}
        description={`${viewing?.city}, ${viewing?.state} · ${viewing?.pincode}`}
        footer={
        <Button variant="secondary" data-close onClick={() => setViewing(null)}>
            Close
          </Button>
        }>
        
        {viewing &&
        <MapPreview
          address={viewing.address}
          city={`${viewing.city}, ${viewing.state}`}
          latitude={viewing.latitude}
          longitude={viewing.longitude}
          height={220} />

        }
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        icon={Trash2Icon}
        title="Delete this location?"
        description="Locations linked to an incident record cannot be deleted."
        confirmLabel="Delete location" />
      
    </div>);

}