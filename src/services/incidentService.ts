import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, setDoc } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import type {
  EmergencyType,
  Incident,
  IncidentStatus,
  IncidentStatusEvent,
  LocationRecord,
  Priority
} from '../types';
import { locationService } from './locationService';
import { notificationService } from './notificationService';
import { responseService } from './responseService';

export interface NewIncidentInput {
  userId: string;
  type: EmergencyType;
  priority: Priority;
  description: string;
  location: Omit<LocationRecord, 'id'>;
  contactName?: string;
  contactPhone?: string;
}

const INCIDENTS_COL = 'incidents';
const EVENTS_COL = 'statusEvents';

// Utility to generate random code
function nextIncidentCode() {
  const digits = Math.floor(Math.random() * 900000) + 100000;
  return `EMG-${digits}`;
}

export const incidentService = {
  async list(): Promise<Incident[]> {
    const q = query(collection(firestore, INCIDENTS_COL), orderBy('reportedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
  },

  async listByUser(userId: string): Promise<Incident[]> {
    const q = query(
      collection(firestore, INCIDENTS_COL),
      where('userId', '==', userId)
      // Note: Requires a composite index in Firestore for userId + reportedAt if orderBy is added.
      // Doing in-memory sort for now to avoid index error.
    );
    const snapshot = await getDocs(q);
    const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
    return incidents.sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  },

  async get(id: string): Promise<Incident> {
    const docRef = doc(firestore, INCIDENTS_COL, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      // Fallback for code
      const q = query(collection(firestore, INCIDENTS_COL), where('code', '==', id));
      const qSnap = await getDocs(q);
      if (qSnap.empty) throw new Error(`Incident ${id} could not be found.`);
      return { id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as Incident;
    }
    return { id: snapshot.id, ...snapshot.data() } as Incident;
  },

  async timeline(incidentId: string): Promise<IncidentStatusEvent[]> {
    const q = query(
      collection(firestore, EVENTS_COL),
      where('incidentId', '==', incidentId)
    );
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncidentStatusEvent));
    return events.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async create(input: NewIncidentInput): Promise<Incident> {
    const location = await locationService.createSilently(input.location);
    const code = nextIncidentCode();
    
    const incidentData = {
      code,
      userId: input.userId,
      type: input.type,
      priority: input.priority,
      description: input.description,
      locationId: location.id,
      status: 'Reported',
      reportedAt: new Date().toISOString(),
      contactName: input.contactName || '',
      contactPhone: input.contactPhone || ''
    };

    const docRef = await addDoc(collection(firestore, INCIDENTS_COL), incidentData);
    
    const incident: Incident = {
      id: docRef.id,
      ...incidentData
    } as Incident;

    await addDoc(collection(firestore, EVENTS_COL), {
      incidentId: incident.id,
      status: 'Reported',
      actor: 'Citizen report',
      note: 'Report received via web portal.',
      createdAt: incident.reportedAt
    });

    notificationService.pushSilently({
      userId: 'ADM-0001',
      incidentId: incident.id,
      title: 'New emergency reported',
      message: `${incident.type} reported at ${location.address} with ${incident.priority.toLowerCase()} priority.`,
      kind: incident.priority === 'Critical' ? 'critical' : 'info'
    });
    
    return incident;
  },

  async updateStatus(id: string, status: IncidentStatus, note?: string): Promise<Incident> {
    const incident = await this.get(id);
    const updatedData: Partial<Incident> = {
      status,
      closedAt: status === 'Closed' ? new Date().toISOString() : incident.closedAt
    };

    await updateDoc(doc(firestore, INCIDENTS_COL, incident.id), updatedData);

    await addDoc(collection(firestore, EVENTS_COL), {
      incidentId: incident.id,
      status,
      actor: 'Dispatch Control',
      note: note || '',
      createdAt: new Date().toISOString()
    });

    if (status === 'On Scene' && incident.teamId) {
      await responseService.markArrivalSilently(incident.id);
    }
    if (status === 'Resolved' || status === 'Closed') {
      await responseService.markCompletionSilently(incident.id);
    }
    notificationService.pushSilently({
      userId: incident.userId,
      incidentId: incident.id,
      title: `Status updated — ${status}`,
      message: note?.trim() || `Your emergency ${incident.code} is now marked as ${status}.`,
      kind: status === 'Resolved' || status === 'Closed' ? 'success' : 'info'
    });
    
    return { ...incident, ...updatedData } as Incident;
  },

  async assignTeam(id: string, teamId: string): Promise<void> {
    const incident = await this.get(id);
    
    const updatedData: Partial<Incident> = {
      teamId,
      status: incident.status === 'Reported' ? 'Dispatched' : incident.status
    };

    await updateDoc(doc(firestore, INCIDENTS_COL, incident.id), updatedData);
    
    await addDoc(collection(firestore, EVENTS_COL), {
      incidentId: incident.id,
      status: 'Dispatched',
      actor: 'Dispatch Control',
      note: `Team ${teamId} assigned to the incident.`,
      createdAt: new Date().toISOString()
    });

    await responseService.openSilently(incident.id, teamId, incident.vehicleId);
    
    notificationService.pushSilently({
      userId: incident.userId,
      incidentId: incident.id,
      title: 'Team dispatched',
      message: `A team has been assigned to your emergency ${incident.code}.`,
      kind: 'critical'
    });
  },

  async assignVehicle(id: string, vehicleId: string): Promise<void> {
    const incident = await this.get(id);
    await updateDoc(doc(firestore, INCIDENTS_COL, incident.id), { vehicleId });
    
    notificationService.pushSilently({
      userId: incident.userId,
      incidentId: incident.id,
      title: 'Vehicle assigned',
      message: `A vehicle is responding to ${incident.code}.`,
      kind: 'info'
    });
  },

  async cancel(id: string, reason: string): Promise<void> {
    await this.updateStatus(id, 'Cancelled', reason);
  }
};