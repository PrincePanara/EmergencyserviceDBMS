import { db, delay, notifyChange } from '../data/db';
import type { AppNotification } from '../types';

type PushInput = Omit<AppNotification, 'id' | 'read' | 'createdAt'>;

const makeId = (): string => `NTF-${String(db.notifications.length + 1).padStart(2, '0')}`;

export const notificationService = {
  async listByUser(userId: string): Promise<AppNotification[]> {
    await delay();
    return db.notifications.
    filter((n) => n.userId === userId).
    sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listAll(): Promise<AppNotification[]> {
    await delay();
    return [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listByIncident(incidentId: string): Promise<AppNotification[]> {
    await delay(180);
    return db.notifications.
    filter((n) => n.incidentId === incidentId).
    sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Fire-and-forget insert used by other services inside a larger transaction. */
  pushSilently(input: PushInput): AppNotification {
    const record: AppNotification = {
      ...input,
      id: makeId(),
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications = [record, ...db.notifications];
    return record;
  },

  async send(input: PushInput): Promise<AppNotification> {
    await delay(420);
    const record = this.pushSilently(input);
    notifyChange();
    return record;
  },

  async markRead(id: string): Promise<void> {
    await delay(140);
    db.notifications = db.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    notifyChange();
  },

  async markAllRead(userId: string): Promise<void> {
    await delay(260);
    db.notifications = db.notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n
    );
    notifyChange();
  }
};