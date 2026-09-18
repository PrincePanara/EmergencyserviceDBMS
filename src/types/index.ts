export type Role = 'user' | 'admin';

export type EmergencyType =
'Fire' |
'Medical Emergency' |
'Road Accident' |
'Building Collapse' |
'Flood' |
'Natural Disaster' |
'Electrical Emergency' |
'Chemical Emergency' |
'Other';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
'Reported' |
'Dispatched' |
'Team En Route' |
'On Scene' |
'Resolved' |
'Closed' |
'Cancelled';

export const EMERGENCY_TYPES: EmergencyType[] = [
'Fire',
'Medical Emergency',
'Road Accident',
'Building Collapse',
'Flood',
'Natural Disaster',
'Electrical Emergency',
'Chemical Emergency',
'Other'];


export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

export const INCIDENT_STATUSES: IncidentStatus[] = [
'Reported',
'Dispatched',
'Team En Route',
'On Scene',
'Resolved',
'Closed',
'Cancelled'];


/** Ordered lifecycle used by the status timeline (excludes Cancelled). */
export const STATUS_FLOW: IncidentStatus[] = [
'Reported',
'Dispatched',
'Team En Route',
'On Scene',
'Resolved',
'Closed'];


export interface AppUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photoUrl?: string;
  accountStatus: 'Active' | 'Disabled';
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface LocationRecord {
  id: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface IncidentStatusEvent {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  note?: string;
  actor: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  code: string;
  userId: string;
  type: EmergencyType;
  priority: Priority;
  description: string;
  locationId: string;
  status: IncidentStatus;
  reportedAt: string;
  closedAt?: string;
  teamId?: string;
  vehicleId?: string;
  contactName?: string;
  contactPhone?: string;
}

export type TeamType = 'Fire' | 'Medical' | 'Police' | 'Rescue' | 'Disaster Management';
export type Availability = 'Available' | 'Busy' | 'Offline';

export interface Team {
  id: string;
  name: string;
  type: TeamType;
  contact: string;
  availability: Availability;
  vehicleId?: string;
  memberCount: number;
  station: string;
}

export type VehicleType =
'Ambulance' |
'Fire Truck' |
'Police Vehicle' |
'Rescue Vehicle' |
'Water Tanker';
export type VehicleStatus = 'Available' | 'Dispatched' | 'Maintenance' | 'Unavailable';

export interface Vehicle {
  id: string;
  number: string;
  type: VehicleType;
  teamId?: string;
  status: VehicleStatus;
  capacity: number;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  minimumStock: number;
}

export interface ResourceAllocation {
  id: string;
  incidentId: string;
  resourceId: string;
  quantity: number;
  returnedQuantity: number;
  allocatedAt: string;
  status: 'Allocated' | 'Returned' | 'Consumed';
}

export interface ResponseRecord {
  id: string;
  incidentId: string;
  teamId: string;
  vehicleId?: string;
  dispatchTime: string;
  arrivalTime?: string;
  completionTime?: string;
  notes: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  incidentId?: string;
  title: string;
  message: string;
  kind: 'info' | 'success' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}