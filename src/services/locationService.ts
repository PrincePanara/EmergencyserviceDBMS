import { db, delay, notifyChange } from '../data/db';
import type { LocationRecord } from '../types';

const makeId = (): string => `LOC-${String(db.locations.length + 1).padStart(2, '0')}`;

export const locationService = {
  async list(): Promise<LocationRecord[]> {
    await delay();
    return [...db.locations];
  },

  async get(id: string): Promise<LocationRecord | undefined> {
    await delay(160);
    return db.locations.find((l) => l.id === id);
  },

  /** Used inside other service transactions; does not emit its own change event. */
  async createSilently(input: Omit<LocationRecord, 'id'>): Promise<LocationRecord> {
    const record: LocationRecord = { ...input, id: makeId() };
    db.locations = [...db.locations, record];
    return record;
  },

  async create(input: Omit<LocationRecord, 'id'>): Promise<LocationRecord> {
    await delay(400);
    const record = await this.createSilently(input);
    notifyChange();
    return record;
  },

  async update(id: string, input: Omit<LocationRecord, 'id'>): Promise<void> {
    await delay(400);
    db.locations = db.locations.map((l) => l.id === id ? { ...input, id } : l);
    notifyChange();
  },

  async remove(id: string): Promise<void> {
    await delay(340);
    if (db.incidents.some((i) => i.locationId === id)) {
      throw new Error('This location is linked to an incident and cannot be deleted.');
    }
    db.locations = db.locations.filter((l) => l.id !== id);
    notifyChange();
  },

  async detectCurrent(): Promise<Pick<LocationRecord, 'latitude' | 'longitude' | 'address' | 'city' | 'state' | 'pincode'>> {
    await delay(900);
    return {
      latitude: 22.2823,
      longitude: 70.7688,
      address: 'Kalawad Road, near Crystal Mall',
      city: 'Rajkot',
      state: 'Gujarat',
      pincode: '360005'
    };
  }
};