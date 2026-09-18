import { useAsyncData } from './useAsyncData';
import { notificationService } from '../services/notificationService';
import { resourceService } from '../services/resourceService';
import { responseService } from '../services/responseService';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { vehicleService } from '../services/vehicleService';
import type {
  AppNotification,
  AppUser,
  EmergencyContact,
  Resource,
  ResourceAllocation,
  ResponseRecord,
  Team,
  Vehicle } from
'../types';

export const useTeams = () => useAsyncData<Team[]>(() => teamService.list(), []);

export const useVehicles = () => useAsyncData<Vehicle[]>(() => vehicleService.list(), []);

export const useResources = () => useAsyncData<Resource[]>(() => resourceService.list(), []);

export const useAllocations = () =>
useAsyncData<ResourceAllocation[]>(() => resourceService.listAllocations(), []);

export const useIncidentAllocations = (incidentId?: string) =>
useAsyncData<ResourceAllocation[]>(
  () => incidentId ? resourceService.listAllocationsByIncident(incidentId) : Promise.resolve([]),
  [incidentId]
);

export const useResponses = () => useAsyncData<ResponseRecord[]>(() => responseService.list(), []);

export const useIncidentResponses = (incidentId?: string) =>
useAsyncData<ResponseRecord[]>(
  () => incidentId ? responseService.listByIncident(incidentId) : Promise.resolve([]),
  [incidentId]
);

export const useUsers = () => useAsyncData<AppUser[]>(() => userService.list(), []);

export const useEmergencyContacts = (userId?: string) =>
useAsyncData<EmergencyContact[]>(
  () => userId ? userService.listContacts(userId) : Promise.resolve([]),
  [userId]
);

export const useNotifications = (userId?: string) =>
useAsyncData<AppNotification[]>(
  () => userId ? notificationService.listByUser(userId) : Promise.resolve([]),
  [userId]
);

export const useAllNotifications = () =>
useAsyncData<AppNotification[]>(() => notificationService.listAll(), []);

export const useIncidentNotifications = (incidentId?: string) =>
useAsyncData<AppNotification[]>(
  () => incidentId ? notificationService.listByIncident(incidentId) : Promise.resolve([]),
  [incidentId]
);