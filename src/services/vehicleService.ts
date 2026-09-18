import { db, delay, notifyChange } from '../data/db';
import type { Vehicle, VehicleStatus } from '../types';

export const vehicleService = {
  async list(): Promise<Vehicle[]> {
    await delay();
    return [...db.vehicles];
  },

  async create(input: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    await delay(440);
    if (db.vehicles.some((v) => v.number.toLowerCase() === input.number.trim().toLowerCase())) {
      throw new Error('A vehicle with this registration number already exists.');
    }
    const vehicle: Vehicle = {
      ...input,
      number: input.number.trim().toUpperCase(),
      id: `VEH-${String(db.vehicles.length + 1).padStart(2, '0')}`
    };
    db.vehicles = [...db.vehicles, vehicle];
    notifyChange();
    return vehicle;
  },

  async update(id: string, patch: Partial<Omit<Vehicle, 'id'>>): Promise<void> {
    await delay(400);
    db.vehicles = db.vehicles.map((v) => v.id === id ? { ...v, ...patch } : v);
    if (patch.teamId) {
      db.teams = db.teams.map((t) =>
      t.id === patch.teamId ? { ...t, vehicleId: id } : t.vehicleId === id ? { ...t, vehicleId: undefined } : t
      );
    }
    notifyChange();
  },

  async setStatus(id: string, status: VehicleStatus): Promise<void> {
    await delay(280);
    db.vehicles = db.vehicles.map((v) => v.id === id ? { ...v, status } : v);
    notifyChange();
  },

  async remove(id: string): Promise<void> {
    await delay(360);
    if (db.vehicles.find((v) => v.id === id)?.status === 'Dispatched') {
      throw new Error('A dispatched vehicle cannot be deleted.');
    }
    db.vehicles = db.vehicles.filter((v) => v.id !== id);
    db.teams = db.teams.map((t) => t.vehicleId === id ? { ...t, vehicleId: undefined } : t);
    notifyChange();
  }
};