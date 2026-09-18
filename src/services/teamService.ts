import { db, delay, notifyChange } from '../data/db';
import type { Availability, Team } from '../types';

export const teamService = {
  async list(): Promise<Team[]> {
    await delay();
    return [...db.teams];
  },

  async get(id: string): Promise<Team | undefined> {
    await delay(160);
    return db.teams.find((t) => t.id === id);
  },

  async create(input: Omit<Team, 'id'>): Promise<Team> {
    await delay(460);
    const team: Team = { ...input, id: `TEAM-${String(db.teams.length + 1).padStart(2, '0')}` };
    db.teams = [...db.teams, team];
    if (team.vehicleId) {
      db.vehicles = db.vehicles.map((v) => v.id === team.vehicleId ? { ...v, teamId: team.id } : v);
    }
    notifyChange();
    return team;
  },

  async update(id: string, patch: Partial<Omit<Team, 'id'>>): Promise<void> {
    await delay(420);
    db.teams = db.teams.map((t) => t.id === id ? { ...t, ...patch } : t);
    if (patch.vehicleId) {
      db.vehicles = db.vehicles.map((v) =>
      v.id === patch.vehicleId ? { ...v, teamId: id } : v.teamId === id ? { ...v, teamId: undefined } : v
      );
    }
    notifyChange();
  },

  async setAvailability(id: string, availability: Availability): Promise<void> {
    await delay(300);
    db.teams = db.teams.map((t) => t.id === id ? { ...t, availability } : t);
    notifyChange();
  },

  async remove(id: string): Promise<void> {
    await delay(380);
    const activeIncident = db.incidents.some(
      (i) => i.teamId === id && !['Closed', 'Cancelled', 'Resolved'].includes(i.status)
    );
    if (activeIncident) {
      throw new Error('This team is engaged on an active incident and cannot be deleted.');
    }
    db.teams = db.teams.filter((t) => t.id !== id);
    db.vehicles = db.vehicles.map((v) => v.teamId === id ? { ...v, teamId: undefined } : v);
    notifyChange();
  }
};