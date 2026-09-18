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

const today = new Date();

/** Build an ISO timestamp offset from now, so demo data always looks current. */
export const hoursAgo = (h: number, m = 0): string =>
new Date(today.getTime() - h * 3600_000 - m * 60_000).toISOString();

export const seedUsers: AppUser[] = [
{
  id: 'USR-0001',
  role: 'user',
  name: 'Rahul Patel',
  email: 'rahul@ers.gov.in',
  phone: '+91 98250 11223',
  address: '14, Shreeji Residency, Kalawad Road',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '360005',
  accountStatus: 'Active',
  createdAt: hoursAgo(24 * 210)
},
{
  id: 'USR-0002',
  role: 'user',
  name: 'Amit Shah',
  email: 'amit.shah@ers.gov.in',
  phone: '+91 99043 88120',
  address: 'B-7, Ring Road Complex, 150 Feet Ring Road',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '360004',
  accountStatus: 'Active',
  createdAt: hoursAgo(24 * 160)
},
{
  id: 'USR-0003',
  role: 'user',
  name: 'Priya Patel',
  email: 'priya.patel@ers.gov.in',
  phone: '+91 97250 44190',
  address: '22, Sundar Society, University Road',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '360007',
  accountStatus: 'Active',
  createdAt: hoursAgo(24 * 92)
},
{
  id: 'USR-0004',
  role: 'user',
  name: 'Kiran Mehta',
  email: 'kiran.mehta@ers.gov.in',
  phone: '+91 98795 22014',
  address: '9, Gokul Park, Gondal Road',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '360002',
  accountStatus: 'Disabled',
  createdAt: hoursAgo(24 * 45)
},
{
  id: 'USR-0005',
  role: 'user',
  name: 'Neha Joshi',
  email: 'neha.joshi@ers.gov.in',
  phone: '+91 90999 71256',
  address: '4, Dhebar Heights, Dhebar Road',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '360001',
  accountStatus: 'Active',
  createdAt: hoursAgo(24 * 21)
},
{
  id: 'ADM-0001',
  role: 'admin',
  name: 'Dispatch Control — S. Vyas',
  email: 'control@ers.gov.in',
  phone: '+91 281 244 0100',
  address: 'District Emergency Operations Centre',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '360001',
  accountStatus: 'Active',
  createdAt: hoursAgo(24 * 400)
}];


export const seedContacts: EmergencyContact[] = [
{ id: 'EC-01', userId: 'USR-0001', name: 'Meena Patel', relationship: 'Mother', phone: '+91 98250 11224' },
{ id: 'EC-02', userId: 'USR-0001', name: 'Dr. Ashok Trivedi', relationship: 'Family Doctor', phone: '+91 98240 77810' },
{ id: 'EC-03', userId: 'USR-0002', name: 'Rekha Shah', relationship: 'Spouse', phone: '+91 99043 88121' }];


export const seedLocations: LocationRecord[] = [
{ id: 'LOC-01', address: 'Kalawad Road, near Crystal Mall', city: 'Rajkot', state: 'Gujarat', pincode: '360005', latitude: 22.2823, longitude: 70.7688 },
{ id: 'LOC-02', address: '150 Feet Ring Road, Mavdi Chowk', city: 'Rajkot', state: 'Gujarat', pincode: '360004', latitude: 22.2701, longitude: 70.7832 },
{ id: 'LOC-03', address: 'Dhebar Road, Bhaktinagar Circle', city: 'Rajkot', state: 'Gujarat', pincode: '360002', latitude: 22.2925, longitude: 70.8042 },
{ id: 'LOC-04', address: 'University Road, near Municipal Ward Office', city: 'Rajkot', state: 'Gujarat', pincode: '360007', latitude: 22.2936, longitude: 70.7712 },
{ id: 'LOC-05', address: 'Gondal Road, Shapar Industrial Zone', city: 'Rajkot', state: 'Gujarat', pincode: '360002', latitude: 22.2401, longitude: 70.8225 },
{ id: 'LOC-06', address: 'Yagnik Road, Trikon Baug', city: 'Rajkot', state: 'Gujarat', pincode: '360001', latitude: 22.3011, longitude: 70.7961 }];


export const seedTeams: Team[] = [
{ id: 'TEAM-01', name: 'Rajkot Fire Team 01', type: 'Fire', contact: '+91 281 244 1101', availability: 'Busy', vehicleId: 'VEH-02', memberCount: 8, station: 'Central Fire Station' },
{ id: 'TEAM-02', name: 'Rajkot Medical Team 01', type: 'Medical', contact: '+91 281 244 1102', availability: 'Busy', vehicleId: 'VEH-01', memberCount: 5, station: 'Civil Hospital Base' },
{ id: 'TEAM-03', name: 'Rajkot Police Team 01', type: 'Police', contact: '+91 281 244 1103', availability: 'Available', vehicleId: 'VEH-03', memberCount: 6, station: 'Malaviyanagar Post' },
{ id: 'TEAM-04', name: 'Rajkot Rescue Team 01', type: 'Rescue', contact: '+91 281 244 1104', availability: 'Available', vehicleId: 'VEH-04', memberCount: 10, station: 'West Zone Depot' },
{ id: 'TEAM-05', name: 'Rajkot Disaster Team 01', type: 'Disaster Management', contact: '+91 281 244 1105', availability: 'Offline', vehicleId: 'VEH-05', memberCount: 12, station: 'District EOC' }];


export const seedVehicles: Vehicle[] = [
{ id: 'VEH-01', number: 'GJ03AB1001', type: 'Ambulance', teamId: 'TEAM-02', status: 'Dispatched', capacity: 2 },
{ id: 'VEH-02', number: 'GJ03AB1002', type: 'Fire Truck', teamId: 'TEAM-01', status: 'Dispatched', capacity: 8 },
{ id: 'VEH-03', number: 'GJ03AB1003', type: 'Police Vehicle', teamId: 'TEAM-03', status: 'Available', capacity: 6 },
{ id: 'VEH-04', number: 'GJ03AB1004', type: 'Rescue Vehicle', teamId: 'TEAM-04', status: 'Available', capacity: 10 },
{ id: 'VEH-05', number: 'GJ03AB1005', type: 'Water Tanker', teamId: 'TEAM-05', status: 'Maintenance', capacity: 4 }];


export const seedResources: Resource[] = [
{ id: 'RES-01', name: 'Oxygen Cylinder', type: 'Medical', quantity: 50, unit: 'Cylinder', minimumStock: 10 },
{ id: 'RES-02', name: 'Fire Extinguisher (CO₂)', type: 'Fire Safety', quantity: 12, unit: 'Unit', minimumStock: 15 },
{ id: 'RES-03', name: 'Trauma First-Aid Kit', type: 'Medical', quantity: 34, unit: 'Kit', minimumStock: 12 },
{ id: 'RES-04', name: 'Hydraulic Cutter', type: 'Rescue', quantity: 4, unit: 'Set', minimumStock: 4 },
{ id: 'RES-05', name: 'Rescue Rope (50m)', type: 'Rescue', quantity: 22, unit: 'Coil', minimumStock: 8 },
{ id: 'RES-06', name: 'Life Jacket', type: 'Flood Response', quantity: 60, unit: 'Piece', minimumStock: 20 },
{ id: 'RES-07', name: 'Portable Water Pump', type: 'Flood Response', quantity: 3, unit: 'Unit', minimumStock: 5 },
{ id: 'RES-08', name: 'Chemical Suit', type: 'Hazmat', quantity: 16, unit: 'Suit', minimumStock: 6 }];


export const seedIncidents: Incident[] = [
{
  id: 'INC-0001',
  code: 'INC-0001',
  userId: 'USR-0001',
  type: 'Fire',
  priority: 'Critical',
  description:
  'Heavy smoke and visible flames from the second floor of a commercial complex. Around 20 people evacuated to the parking area, two shops still locked.',
  locationId: 'LOC-01',
  status: 'Team En Route',
  reportedAt: hoursAgo(0, 42),
  teamId: 'TEAM-01',
  vehicleId: 'VEH-02',
  contactName: 'Meena Patel',
  contactPhone: '+91 98250 11224'
},
{
  id: 'INC-0002',
  code: 'INC-0002',
  userId: 'USR-0002',
  type: 'Road Accident',
  priority: 'High',
  description:
  'Two-vehicle collision at the ring road junction. One driver trapped, traffic blocked in both directions.',
  locationId: 'LOC-02',
  status: 'On Scene',
  reportedAt: hoursAgo(1, 25),
  teamId: 'TEAM-02',
  vehicleId: 'VEH-01'
},
{
  id: 'INC-0003',
  code: 'INC-0003',
  userId: 'USR-0003',
  type: 'Medical Emergency',
  priority: 'Critical',
  description: 'Elderly resident with chest pain and breathing difficulty, conscious but unstable.',
  locationId: 'LOC-04',
  status: 'Dispatched',
  reportedAt: hoursAgo(0, 18),
  teamId: 'TEAM-02'
},
{
  id: 'INC-0004',
  code: 'INC-0004',
  userId: 'USR-0001',
  type: 'Electrical Emergency',
  priority: 'Medium',
  description: 'Transformer sparking near a residential gate, power line sagging over the footpath.',
  locationId: 'LOC-06',
  status: 'Reported',
  reportedAt: hoursAgo(0, 9)
},
{
  id: 'INC-0005',
  code: 'INC-0005',
  userId: 'USR-0005',
  type: 'Building Collapse',
  priority: 'High',
  description: 'Partial balcony collapse of an old three-storey structure. No confirmed casualties yet.',
  locationId: 'LOC-03',
  status: 'Resolved',
  reportedAt: hoursAgo(9, 30),
  teamId: 'TEAM-04',
  vehicleId: 'VEH-04'
},
{
  id: 'INC-0006',
  code: 'INC-0006',
  userId: 'USR-0001',
  type: 'Flood',
  priority: 'Medium',
  description: 'Waterlogging up to knee height after overnight rain, two lanes impassable.',
  locationId: 'LOC-05',
  status: 'Closed',
  reportedAt: hoursAgo(52),
  closedAt: hoursAgo(44),
  teamId: 'TEAM-05',
  vehicleId: 'VEH-05'
},
{
  id: 'INC-0007',
  code: 'INC-0007',
  userId: 'USR-0002',
  type: 'Medical Emergency',
  priority: 'Low',
  description: 'Minor kitchen burn injury, patient stable and mobile.',
  locationId: 'LOC-02',
  status: 'Closed',
  reportedAt: hoursAgo(76),
  closedAt: hoursAgo(74),
  teamId: 'TEAM-02',
  vehicleId: 'VEH-01'
},
{
  id: 'INC-0008',
  code: 'INC-0008',
  userId: 'USR-0003',
  type: 'Chemical Emergency',
  priority: 'Critical',
  description: 'Industrial solvent leak in a storage shed, strong fumes reported by nearby workers.',
  locationId: 'LOC-05',
  status: 'Closed',
  reportedAt: hoursAgo(120),
  closedAt: hoursAgo(112),
  teamId: 'TEAM-04',
  vehicleId: 'VEH-04'
},
{
  id: 'INC-0009',
  code: 'INC-0009',
  userId: 'USR-0001',
  type: 'Road Accident',
  priority: 'Medium',
  description: 'Two-wheeler skidded near the traffic circle, rider with leg injury.',
  locationId: 'LOC-06',
  status: 'Closed',
  reportedAt: hoursAgo(150),
  closedAt: hoursAgo(147),
  teamId: 'TEAM-02',
  vehicleId: 'VEH-01'
},
{
  id: 'INC-0010',
  code: 'INC-0010',
  userId: 'USR-0005',
  type: 'Other',
  priority: 'Low',
  description: 'Fallen tree partially blocking a residential lane after heavy wind.',
  locationId: 'LOC-04',
  status: 'Cancelled',
  reportedAt: hoursAgo(200)
}];


const ev = (
id: string,
incidentId: string,
status: IncidentStatusEvent['status'],
createdAt: string,
actor: string,
note?: string)
: IncidentStatusEvent => ({ id, incidentId, status, createdAt, actor, note });

export const seedStatusEvents: IncidentStatusEvent[] = [
ev('EVT-001', 'INC-0001', 'Reported', hoursAgo(0, 42), 'Rahul Patel', 'Citizen report received via web portal.'),
ev('EVT-002', 'INC-0001', 'Dispatched', hoursAgo(0, 38), 'Dispatch Control', 'Rajkot Fire Team 01 assigned with GJ03AB1002.'),
ev('EVT-003', 'INC-0001', 'Team En Route', hoursAgo(0, 34), 'Rajkot Fire Team 01', 'Unit left Central Fire Station.'),
ev('EVT-004', 'INC-0002', 'Reported', hoursAgo(1, 25), 'Amit Shah'),
ev('EVT-005', 'INC-0002', 'Dispatched', hoursAgo(1, 20), 'Dispatch Control', 'Medical Team 01 assigned.'),
ev('EVT-006', 'INC-0002', 'Team En Route', hoursAgo(1, 14), 'Rajkot Medical Team 01'),
ev('EVT-007', 'INC-0002', 'On Scene', hoursAgo(1, 2), 'Rajkot Medical Team 01', 'Extrication in progress with police support.'),
ev('EVT-008', 'INC-0003', 'Reported', hoursAgo(0, 18), 'Priya Patel'),
ev('EVT-009', 'INC-0003', 'Dispatched', hoursAgo(0, 12), 'Dispatch Control', 'Ambulance requested from Civil Hospital Base.'),
ev('EVT-010', 'INC-0004', 'Reported', hoursAgo(0, 9), 'Rahul Patel'),
ev('EVT-011', 'INC-0005', 'Reported', hoursAgo(9, 30), 'Neha Joshi'),
ev('EVT-012', 'INC-0005', 'Dispatched', hoursAgo(9, 22), 'Dispatch Control'),
ev('EVT-013', 'INC-0005', 'Team En Route', hoursAgo(9, 15), 'Rajkot Rescue Team 01'),
ev('EVT-014', 'INC-0005', 'On Scene', hoursAgo(8, 50), 'Rajkot Rescue Team 01'),
ev('EVT-015', 'INC-0005', 'Resolved', hoursAgo(6, 30), 'Rajkot Rescue Team 01', 'Structure cordoned, residents relocated.'),
ev('EVT-016', 'INC-0006', 'Reported', hoursAgo(52), 'Rahul Patel'),
ev('EVT-017', 'INC-0006', 'Dispatched', hoursAgo(51), 'Dispatch Control'),
ev('EVT-018', 'INC-0006', 'On Scene', hoursAgo(49), 'Rajkot Disaster Team 01'),
ev('EVT-019', 'INC-0006', 'Resolved', hoursAgo(46), 'Rajkot Disaster Team 01', 'Pumping completed.'),
ev('EVT-020', 'INC-0006', 'Closed', hoursAgo(44), 'Dispatch Control')];


export const seedAllocations: ResourceAllocation[] = [
{ id: 'ALC-01', incidentId: 'INC-0001', resourceId: 'RES-02', quantity: 6, returnedQuantity: 0, allocatedAt: hoursAgo(0, 36), status: 'Allocated' },
{ id: 'ALC-02', incidentId: 'INC-0001', resourceId: 'RES-01', quantity: 4, returnedQuantity: 0, allocatedAt: hoursAgo(0, 35), status: 'Allocated' },
{ id: 'ALC-03', incidentId: 'INC-0002', resourceId: 'RES-03', quantity: 2, returnedQuantity: 0, allocatedAt: hoursAgo(1, 10), status: 'Allocated' },
{ id: 'ALC-04', incidentId: 'INC-0002', resourceId: 'RES-04', quantity: 1, returnedQuantity: 0, allocatedAt: hoursAgo(1, 8), status: 'Allocated' },
{ id: 'ALC-05', incidentId: 'INC-0005', resourceId: 'RES-05', quantity: 3, returnedQuantity: 3, allocatedAt: hoursAgo(9), status: 'Returned' },
{ id: 'ALC-06', incidentId: 'INC-0006', resourceId: 'RES-06', quantity: 12, returnedQuantity: 12, allocatedAt: hoursAgo(50), status: 'Returned' },
{ id: 'ALC-07', incidentId: 'INC-0008', resourceId: 'RES-08', quantity: 5, returnedQuantity: 4, allocatedAt: hoursAgo(119), status: 'Consumed' }];


export const seedResponses: ResponseRecord[] = [
{ id: 'RSP-01', incidentId: 'INC-0001', teamId: 'TEAM-01', vehicleId: 'VEH-02', dispatchTime: hoursAgo(0, 38), notes: ['Two units dispatched, water tanker on standby.'] },
{ id: 'RSP-02', incidentId: 'INC-0002', teamId: 'TEAM-02', vehicleId: 'VEH-01', dispatchTime: hoursAgo(1, 20), arrivalTime: hoursAgo(1, 2), notes: ['Arrived in 18 minutes, traffic diversion requested.'] },
{ id: 'RSP-03', incidentId: 'INC-0003', teamId: 'TEAM-02', dispatchTime: hoursAgo(0, 12), notes: [] },
{ id: 'RSP-04', incidentId: 'INC-0005', teamId: 'TEAM-04', vehicleId: 'VEH-04', dispatchTime: hoursAgo(9, 22), arrivalTime: hoursAgo(8, 50), completionTime: hoursAgo(6, 30), notes: ['Structure declared unsafe.', 'Handover to municipal engineer.'] },
{ id: 'RSP-05', incidentId: 'INC-0006', teamId: 'TEAM-05', vehicleId: 'VEH-05', dispatchTime: hoursAgo(51), arrivalTime: hoursAgo(49, 30), completionTime: hoursAgo(46), notes: ['Two pumps deployed.'] },
{ id: 'RSP-06', incidentId: 'INC-0007', teamId: 'TEAM-02', vehicleId: 'VEH-01', dispatchTime: hoursAgo(75, 40), arrivalTime: hoursAgo(75, 25), completionTime: hoursAgo(74, 30), notes: [] },
{ id: 'RSP-07', incidentId: 'INC-0008', teamId: 'TEAM-04', vehicleId: 'VEH-04', dispatchTime: hoursAgo(119, 30), arrivalTime: hoursAgo(119), completionTime: hoursAgo(113), notes: ['Hazmat protocol followed.'] },
{ id: 'RSP-08', incidentId: 'INC-0009', teamId: 'TEAM-02', vehicleId: 'VEH-01', dispatchTime: hoursAgo(149, 40), arrivalTime: hoursAgo(149, 19), completionTime: hoursAgo(147, 30), notes: [] }];


export const seedNotifications: AppNotification[] = [
{ id: 'NTF-01', userId: 'USR-0001', incidentId: 'INC-0001', title: 'Team dispatched', message: 'Rajkot Fire Team 01 has been dispatched to Kalawad Road with vehicle GJ03AB1002.', kind: 'critical', read: false, createdAt: hoursAgo(0, 38) },
{ id: 'NTF-02', userId: 'USR-0001', incidentId: 'INC-0001', title: 'Team en route', message: 'Your assigned team has left the station and is en route to the incident location.', kind: 'warning', read: false, createdAt: hoursAgo(0, 34) },
{ id: 'NTF-03', userId: 'USR-0001', incidentId: 'INC-0004', title: 'Additional information required', message: 'Please confirm whether the power supply to the transformer is still live.', kind: 'info', read: false, createdAt: hoursAgo(0, 6) },
{ id: 'NTF-04', userId: 'USR-0001', incidentId: 'INC-0006', title: 'Incident resolved', message: 'Waterlogging at Gondal Road has been cleared. The incident is now closed.', kind: 'success', read: true, createdAt: hoursAgo(46) },
{ id: 'NTF-05', userId: 'USR-0002', incidentId: 'INC-0002', title: 'Emergency team has arrived', message: 'Rajkot Medical Team 01 is on scene at 150 Feet Ring Road.', kind: 'info', read: false, createdAt: hoursAgo(1, 2) },
{ id: 'NTF-06', userId: 'USR-0003', incidentId: 'INC-0003', title: 'Team dispatched', message: 'An ambulance has been dispatched from Civil Hospital Base.', kind: 'critical', read: false, createdAt: hoursAgo(0, 12) },
{ id: 'NTF-07', userId: 'ADM-0001', incidentId: 'INC-0004', title: 'Unassigned incident', message: 'INC-0004 has been in Reported state for over 5 minutes without a team.', kind: 'warning', read: false, createdAt: hoursAgo(0, 4) }];