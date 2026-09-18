import type {
  AppNotification,
  AppUser,
  EmergencyContact,
  Incident,
  IncidentStatusEvent,
  LocationRecord,
  Resource,
  ResourceAllocation,
  ResponseRecord,
  Team,
  Vehicle } from
'../types';
import {
  seedAllocations,
  seedContacts,
  seedIncidents,
  seedLocations,
  seedNotifications,
  seedResources,
  seedResponses,
  seedStatusEvents,
  seedTeams,
  seedUsers,
  seedVehicles } from
'./seed';

interface Database {
  users: AppUser[];
  contacts: EmergencyContact[];
  locations: LocationRecord[];
  incidents: Incident[];
  statusEvents: IncidentStatusEvent[];
  teams: Team[];
  vehicles: Vehicle[];
  resources: Resource[];
  allocations: ResourceAllocation[];
  responses: ResponseRecord[];
  notifications: AppNotification[];
}

/**
 * In-memory stand-in for the backend database. Every service reads and writes
 * through here so swapping in Firestore/REST only touches the service layer.
 */
export const db: Database = {
  users: [...seedUsers],
  contacts: [...seedContacts],
  locations: [...seedLocations],
  incidents: [...seedIncidents],
  statusEvents: [...seedStatusEvents],
  teams: [...seedTeams],
  vehicles: [...seedVehicles],
  resources: [...seedResources],
  allocations: [...seedAllocations],
  responses: [...seedResponses],
  notifications: [...seedNotifications]
};

type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notifyChange = (): void => {
  listeners.forEach((listener) => listener());
};

/** Simulated network latency so loading states are real. */
export const delay = (ms = 320): Promise<void> =>
new Promise((resolve) => setTimeout(resolve, ms));

export const nextId = (prefix: string, existing: {id: string;}[]): string =>
`${prefix}-${String(existing.length + 1).padStart(2, '0')}`;

export const nextIncidentCode = (): string => {
  const max = db.incidents.reduce((acc, incident) => {
    const n = Number(incident.code.replace('INC-', ''));
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `INC-${String(max + 1).padStart(4, '0')}`;
};