import { db, delay, nextId, notifyChange } from '../data/db';
import type { ResponseRecord } from '../types';

export const responseService = {
  async list(): Promise<ResponseRecord[]> {
    await delay();
    return [...db.responses].sort((a, b) => b.dispatchTime.localeCompare(a.dispatchTime));
  },

  async listByIncident(incidentId: string): Promise<ResponseRecord[]> {
    await delay(200);
    return db.responses.filter((r) => r.incidentId === incidentId);
  },

  async openSilently(incidentId: string, teamId: string, vehicleId?: string): Promise<void> {
    const existing = db.responses.find((r) => r.incidentId === incidentId && !r.completionTime);
    if (existing) {
      db.responses = db.responses.map((r) =>
      r.id === existing.id ? { ...r, teamId, vehicleId: vehicleId ?? r.vehicleId } : r
      );
      return;
    }
    db.responses = [
    ...db.responses,
    {
      id: nextId('RSP', db.responses),
      incidentId,
      teamId,
      vehicleId,
      dispatchTime: new Date().toISOString(),
      notes: []
    }];

  },

  async create(input: {
    incidentId: string;
    teamId: string;
    vehicleId?: string;
    note?: string;
  }): Promise<void> {
    await delay(420);
    db.responses = [
    ...db.responses,
    {
      id: nextId('RSP', db.responses),
      incidentId: input.incidentId,
      teamId: input.teamId,
      vehicleId: input.vehicleId,
      dispatchTime: new Date().toISOString(),
      notes: input.note ? [input.note] : []
    }];

    notifyChange();
  },

  async markArrivalSilently(incidentId: string): Promise<void> {
    db.responses = db.responses.map((r) =>
    r.incidentId === incidentId && !r.arrivalTime ?
    { ...r, arrivalTime: new Date().toISOString() } :
    r
    );
  },

  async markArrival(id: string): Promise<void> {
    await delay(320);
    db.responses = db.responses.map((r) =>
    r.id === id ? { ...r, arrivalTime: r.arrivalTime ?? new Date().toISOString() } : r
    );
    notifyChange();
  },

  async markCompletionSilently(incidentId: string): Promise<void> {
    const now = new Date().toISOString();
    db.responses = db.responses.map((r) =>
    r.incidentId === incidentId && !r.completionTime ?
    { ...r, arrivalTime: r.arrivalTime ?? now, completionTime: now } :
    r
    );
    const teamIds = db.responses.
    filter((r) => r.incidentId === incidentId).
    map((r) => r.teamId);
    db.teams = db.teams.map((t) =>
    teamIds.includes(t.id) && t.availability === 'Busy' ? { ...t, availability: 'Available' } : t
    );
  },

  async markCompletion(id: string): Promise<void> {
    await delay(340);
    const now = new Date().toISOString();
    db.responses = db.responses.map((r) =>
    r.id === id ? { ...r, arrivalTime: r.arrivalTime ?? now, completionTime: now } : r
    );
    notifyChange();
  },

  async addNote(id: string, note: string): Promise<void> {
    await delay(300);
    db.responses = db.responses.map((r) =>
    r.id === id ? { ...r, notes: [...r.notes, note] } : r
    );
    notifyChange();
  },

  async addIncidentNote(incidentId: string, note: string): Promise<void> {
    await delay(320);
    const target = db.responses.find((r) => r.incidentId === incidentId);
    if (!target) throw new Error('No response record exists for this incident yet.');
    db.responses = db.responses.map((r) =>
    r.id === target.id ? { ...r, notes: [...r.notes, note] } : r
    );
    notifyChange();
  }
};