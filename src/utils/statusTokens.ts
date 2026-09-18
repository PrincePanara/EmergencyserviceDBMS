import {
  AlertTriangleIcon,
  ActivityIcon,
  AmbulanceIcon,
  BuildingIcon,
  CheckCircle2Icon,
  CloudRainIcon,
  DropletsIcon,
  FlameIcon,
  HelpCircleIcon,
  CarIcon,
  ShieldIcon,
  TruckIcon,
  UsersIcon,
  ZapIcon,
  type LucideIcon } from
'lucide-react';
import type {
  Availability,
  EmergencyType,
  IncidentStatus,
  Priority,
  TeamType,
  VehicleStatus,
  VehicleType } from
'../types';

/** Badge styling is token-driven so status colours stay consistent everywhere. */
export const statusToken: Record<IncidentStatus, {label: string;className: string;dot: string;}> = {
  Reported: {
    label: 'Reported',
    className: 'bg-info-light text-info border-info/25',
    dot: 'bg-info'
  },
  Dispatched: {
    label: 'Dispatched',
    className: 'bg-primary-light text-primary-dark border-primary/25',
    dot: 'bg-primary'
  },
  'Team En Route': {
    label: 'Team En Route',
    className: 'bg-warning-light text-warning border-warning/30',
    dot: 'bg-warning'
  },
  'On Scene': {
    label: 'On Scene',
    className: 'bg-violet-light text-violet border-violet/25',
    dot: 'bg-violet'
  },
  Resolved: {
    label: 'Resolved',
    className: 'bg-success-light text-success border-success/25',
    dot: 'bg-success'
  },
  Closed: {
    label: 'Closed',
    className: 'bg-subtle text-muted border-line',
    dot: 'bg-muted'
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-subtle text-ink/70 border-line line-through decoration-1',
    dot: 'bg-ink/40'
  }
};

export const priorityToken: Record<Priority, {label: string;className: string;dot: string;bars: number;}> = {
  Critical: { label: 'Critical', className: 'bg-primary-light text-primary-dark border-primary/30', dot: 'bg-primary', bars: 4 },
  High: { label: 'High', className: 'bg-warning-light text-warning border-warning/35', dot: 'bg-warning', bars: 3 },
  Medium: { label: 'Medium', className: 'bg-info-light text-info border-info/25', dot: 'bg-info', bars: 2 },
  Low: { label: 'Low', className: 'bg-success-light text-success border-success/25', dot: 'bg-success', bars: 1 }
};

export const availabilityToken: Record<Availability, {className: string;dot: string;}> = {
  Available: { className: 'bg-success-light text-success border-success/25', dot: 'bg-success' },
  Busy: { className: 'bg-warning-light text-warning border-warning/30', dot: 'bg-warning' },
  Offline: { className: 'bg-subtle text-muted border-line', dot: 'bg-muted' }
};

export const vehicleStatusToken: Record<VehicleStatus, {className: string;dot: string;}> = {
  Available: { className: 'bg-success-light text-success border-success/25', dot: 'bg-success' },
  Dispatched: { className: 'bg-primary-light text-primary-dark border-primary/25', dot: 'bg-primary' },
  Maintenance: { className: 'bg-warning-light text-warning border-warning/30', dot: 'bg-warning' },
  Unavailable: { className: 'bg-subtle text-muted border-line', dot: 'bg-muted' }
};

export const emergencyIcon: Record<EmergencyType, LucideIcon> = {
  Fire: FlameIcon,
  'Medical Emergency': AmbulanceIcon,
  'Road Accident': CarIcon,
  'Building Collapse': BuildingIcon,
  Flood: DropletsIcon,
  'Natural Disaster': CloudRainIcon,
  'Electrical Emergency': ZapIcon,
  'Chemical Emergency': AlertTriangleIcon,
  Other: HelpCircleIcon
};

export const teamIcon: Record<TeamType, LucideIcon> = {
  Fire: FlameIcon,
  Medical: AmbulanceIcon,
  Police: ShieldIcon,
  Rescue: UsersIcon,
  'Disaster Management': ActivityIcon
};

export const vehicleIcon: Record<VehicleType, LucideIcon> = {
  Ambulance: AmbulanceIcon,
  'Fire Truck': TruckIcon,
  'Police Vehicle': ShieldIcon,
  'Rescue Vehicle': TruckIcon,
  'Water Tanker': DropletsIcon
};

export const statusStepIcon = {
  done: CheckCircle2Icon
} as const;