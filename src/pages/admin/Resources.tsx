import React, { useMemo, useState } from 'react';
import { AlertTriangleIcon, PackageIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { InlineSelect, Input } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { Badge } from '../../components/ui/Badge';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';
import { useAllocations, useResources } from '../../hooks/useOperations';
import { resourceService } from '../../services/resourceService';
import type { Resource } from '../../types';
import { formatDateTime } from '../../utils/format';

const emptyForm = { name: '', type: '', quantity: '0', unit: 'Unit', minimumStock: '5' };

export function AdminResources() {
  const resources = useResources();
  const allocations = useAllocations();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [stock, setStock] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [adjusting, setAdjusting] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [delta, setDelta] = useState('0');
  const [busy, setBusy] = useState(false);

  const rows = resources.data ?? [];
  const lowStock = rows.filter((r) => r.quantity <= r.minimumStock);

  const filtered = useMemo(
    () =>
    rows.filter((resource) => {
      const haystack = `${resource.name} ${resource.type}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (stock === 'low' && resource.quantity > resource.minimumStock) return false;
      if (stock === 'healthy' && resource.quantity <= resource.minimumStock) return false;
      return true;
    }),
    [rows, query, stock]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditing(resource);
    setForm({
      name: resource.name,
      type: resource.type,
      quantity: String(resource.quantity),
      unit: resource.unit,
      minimumStock: String(resource.minimumStock)
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.warning('Missing details', 'Resource name is required.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type.trim() || 'General',
        quantity: Number(form.quantity) || 0,
        unit: form.unit.trim() || 'Unit',
        minimumStock: Number(form.minimumStock) || 0
      };
      if (editing) {
        await resourceService.update(editing.id, payload);
        toast.success('Resource updated');
      } else {
        await resourceService.create(payload);
        toast.success('Resource added');
      }
      if (payload.quantity <= payload.minimumStock) {
        toast.warning('Resource quantity is below minimum stock.');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Unable to save resource', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const applyDelta = async () => {
    if (!adjusting) return;
    const next = Math.max(0, adjusting.quantity + Number(delta));
    setBusy(true);
    try {
      await resourceService.update(adjusting.id, { quantity: next });
      toast.success('Quantity updated', `${adjusting.name} now at ${next} ${adjusting.unit.toLowerCase()}.`);
      if (next <= adjusting.minimumStock) {
        toast.warning('Resource quantity is below minimum stock.');
      }
      setAdjusting(null);
      setDelta('0');
    } catch {
      toast.error('Unable to update quantity');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await resourceService.remove(deleting.id);
      toast.success('Resource deleted');
      setDeleting(null);
    } catch (err) {
      toast.error('Unable to delete resource', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Resource Management"
        subtitle="Inventory available to response teams, with minimum stock thresholds."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openCreate}>
            Add resource
          </Button>
        } />
      

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Resource types" value={rows.length} icon={PackageIcon} />
        <StatCard
          label="Total units in stock"
          value={rows.reduce((sum, r) => sum + r.quantity, 0)}
          icon={PackageIcon} />
        
        <StatCard
          label="Low stock items"
          value={lowStock.length}
          icon={AlertTriangleIcon}
          tone={lowStock.length ? 'critical' : 'success'}
          hint={lowStock.length ? 'Replenishment required' : 'All healthy'} />
        
        <StatCard
          label="Active allocations"
          value={(allocations.data ?? []).filter((a) => a.status === 'Allocated').length}
          icon={PackageIcon} />
        
      </div>

      <Card>
        <FilterBar activeCount={stock !== 'all' ? 1 : 0} onReset={() => setStock('all')}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search resources" className="min-w-[200px]" />
          <InlineSelect
            label="Stock status"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            options={[
            { value: 'all', label: 'All stock' },
            { value: 'low', label: 'Low stock only' },
            { value: 'healthy', label: 'Healthy only' }]
            } />
          
        </FilterBar>

        {resources.error ?
        <ErrorState inline onRetry={resources.reload} /> :
        resources.loading ?
        <TableSkeleton rows={6} columns={6} /> :
        filtered.length === 0 ?
        <EmptyState icon={PackageIcon} title="No resources found" description="Adjust the filters or add inventory." /> :

        <TableWrap>
            <thead>
              <tr>
                <Th>Resource</Th>
                <Th>Type</Th>
                <Th>Available quantity</Th>
                <Th>Unit</Th>
                <Th>Minimum stock</Th>
                <Th>Stock status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource) => {
              const low = resource.quantity <= resource.minimumStock;
              return (
                <Tr key={resource.id} critical={low}>
                    <Td className="font-medium">{resource.name}</Td>
                    <Td className="text-muted">{resource.type}</Td>
                    <Td className="font-semibold">{resource.quantity}</Td>
                    <Td className="text-muted">{resource.unit}</Td>
                    <Td className="text-muted">Minimum {resource.minimumStock}</Td>
                    <Td>
                      {low ?
                    <Badge tone="primary">
                          <AlertTriangleIcon className="h-3 w-3" aria-hidden />
                          LOW STOCK
                        </Badge> :

                    <Badge tone="success">Healthy</Badge>
                    }
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" onClick={() => {setAdjusting(resource);setDelta('0');}}>
                          Update qty
                        </Button>
                        <Button size="sm" icon={PencilIcon} onClick={() => openEdit(resource)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2Icon} onClick={() => setDeleting(resource)}>
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

      <Card>
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-[17px] font-semibold text-ink">Allocation history</h2>
          <p className="mt-0.5 text-[13px] text-muted">Stock committed to incidents across the district.</p>
        </div>
        {allocations.loading ?
        <TableSkeleton rows={4} columns={6} /> :
        (allocations.data ?? []).length === 0 ?
        <EmptyState icon={PackageIcon} title="No allocations recorded" /> :

        <TableWrap>
            <thead>
              <tr>
                <Th>Incident</Th>
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
                  <Td className="font-mono text-[12px] font-semibold">{allocation.incidentId}</Td>
                  <Td className="font-medium">
                    {rows.find((r) => r.id === allocation.resourceId)?.name ?? allocation.resourceId}
                  </Td>
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

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit resource' : 'Add resource'}
        icon={PackageIcon}
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={save}>
              {editing ? 'Save changes' : 'Add resource'}
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Resource name"
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Oxygen Cylinder" />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              placeholder="Medical" />
            
            <Input
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              placeholder="Cylinder" />
            
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Available quantity"
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
            
            <Input
              label="Minimum stock"
              type="number"
              min={0}
              value={form.minimumStock}
              onChange={(e) => setForm((p) => ({ ...p, minimumStock: e.target.value }))}
              hint="Below this level the item is flagged LOW STOCK." />
            
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        title={`Update quantity — ${adjusting?.name ?? ''}`}
        description="Use a positive number to restock, a negative number to write off."
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setAdjusting(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={applyDelta}>
              Apply change
            </Button>
          </>
        }>
        
        <Input
          label="Quantity change"
          type="number"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          hint={
          adjusting ?
          `Current stock ${adjusting.quantity} ${adjusting.unit.toLowerCase()} → new stock ${Math.max(
            0,
            adjusting.quantity + Number(delta || 0)
          )}` :
          undefined
          } />
        
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        icon={Trash2Icon}
        title={`Delete ${deleting?.name ?? 'resource'}?`}
        description="Resources with active allocations cannot be deleted."
        confirmLabel="Delete resource" />
      
    </div>);

}