import { db, delay, nextId, notifyChange } from '../data/db';
import type { Resource, ResourceAllocation } from '../types';

export const resourceService = {
  async list(): Promise<Resource[]> {
    await delay();
    return [...db.resources];
  },

  async create(input: Omit<Resource, 'id'>): Promise<Resource> {
    await delay(440);
    const resource: Resource = {
      ...input,
      id: `RES-${String(db.resources.length + 1).padStart(2, '0')}`
    };
    db.resources = [...db.resources, resource];
    notifyChange();
    return resource;
  },

  async update(id: string, patch: Partial<Omit<Resource, 'id'>>): Promise<void> {
    await delay(400);
    db.resources = db.resources.map((r) => r.id === id ? { ...r, ...patch } : r);
    notifyChange();
  },

  async remove(id: string): Promise<void> {
    await delay(360);
    if (db.allocations.some((a) => a.resourceId === id && a.status === 'Allocated')) {
      throw new Error('This resource has active allocations and cannot be deleted.');
    }
    db.resources = db.resources.filter((r) => r.id !== id);
    notifyChange();
  },

  async listAllocations(): Promise<ResourceAllocation[]> {
    await delay();
    return [...db.allocations].sort((a, b) => b.allocatedAt.localeCompare(a.allocatedAt));
  },

  async listAllocationsByIncident(incidentId: string): Promise<ResourceAllocation[]> {
    await delay(200);
    return db.allocations.
    filter((a) => a.incidentId === incidentId).
    sort((a, b) => b.allocatedAt.localeCompare(a.allocatedAt));
  },

  async allocate(incidentId: string, resourceId: string, quantity: number): Promise<void> {
    await delay(460);
    const resource = db.resources.find((r) => r.id === resourceId);
    if (!resource) throw new Error('Resource not found.');
    if (quantity <= 0) throw new Error('Quantity must be greater than zero.');
    if (quantity > resource.quantity) {
      throw new Error(
        `Only ${resource.quantity} ${resource.unit.toLowerCase()}(s) of ${resource.name} are available.`
      );
    }
    db.resources = db.resources.map((r) =>
    r.id === resourceId ? { ...r, quantity: r.quantity - quantity } : r
    );
    db.allocations = [
    ...db.allocations,
    {
      id: nextId('ALC', db.allocations),
      incidentId,
      resourceId,
      quantity,
      returnedQuantity: 0,
      allocatedAt: new Date().toISOString(),
      status: 'Allocated'
    }];

    notifyChange();
  },

  async returnAllocation(id: string, returnedQuantity: number): Promise<void> {
    await delay(400);
    const allocation = db.allocations.find((a) => a.id === id);
    if (!allocation) throw new Error('Allocation not found.');
    const returned = Math.min(returnedQuantity, allocation.quantity);
    db.allocations = db.allocations.map((a) =>
    a.id === id ?
    {
      ...a,
      returnedQuantity: returned,
      status: returned === a.quantity ? 'Returned' : 'Consumed'
    } :
    a
    );
    db.resources = db.resources.map((r) =>
    r.id === allocation.resourceId ? { ...r, quantity: r.quantity + returned } : r
    );
    notifyChange();
  }
};