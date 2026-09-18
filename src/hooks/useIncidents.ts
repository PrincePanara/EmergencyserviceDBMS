import { useAsyncData } from './useAsyncData';
import { incidentService } from '../services/incidentService';
import { locationService } from '../services/locationService';
import type { Incident, LocationRecord } from '../types';

export const useIncidents = () => useAsyncData<Incident[]>(() => incidentService.list(), []);

export const useUserIncidents = (userId?: string) =>
useAsyncData<Incident[]>(
  () => userId ? incidentService.listByUser(userId) : Promise.resolve([]),
  [userId]
);

export const useIncident = (id?: string) =>
useAsyncData<Incident | null>(
  () => id ? incidentService.get(id) : Promise.resolve(null),
  [id]
);

export const useIncidentTimeline = (id?: string) =>
useAsyncData(() => id ? incidentService.timeline(id) : Promise.resolve([]), [id]);

export const useLocations = () =>
useAsyncData<LocationRecord[]>(() => locationService.list(), []);