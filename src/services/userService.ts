import { db, delay, notifyChange } from '../data/db';
import type { AppUser, EmergencyContact } from '../types';

export const userService = {
  async list(): Promise<AppUser[]> {
    await delay();
    return db.users.filter((u) => u.role === 'user');
  },

  async get(id: string): Promise<AppUser | undefined> {
    await delay(180);
    return db.users.find((u) => u.id === id);
  },

  async update(id: string, patch: Partial<AppUser>): Promise<AppUser> {
    await delay(420);
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found.');
    const updated = { ...user, ...patch, id: user.id, role: user.role };
    db.users = db.users.map((u) => u.id === id ? updated : u);
    notifyChange();
    return updated;
  },

  async setAccountStatus(id: string, accountStatus: AppUser['accountStatus']): Promise<void> {
    await delay(360);
    db.users = db.users.map((u) => u.id === id ? { ...u, accountStatus } : u);
    notifyChange();
  },

  async remove(id: string): Promise<void> {
    await delay(400);
    db.users = db.users.filter((u) => u.id !== id);
    db.contacts = db.contacts.filter((c) => c.userId !== id);
    notifyChange();
  },

  async changePassword(current: string, next: string): Promise<void> {
    await delay(500);
    if (current.trim().length < 6) throw new Error('Current password is incorrect.');
    if (next.trim().length < 8) throw new Error('New password must be at least 8 characters.');
  },

  // --- Emergency contacts (users └── emergency_contacts) ---
  async listContacts(userId: string): Promise<EmergencyContact[]> {
    await delay();
    return db.contacts.filter((c) => c.userId === userId);
  },

  async addContact(input: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    await delay(420);
    const contact: EmergencyContact = {
      ...input,
      id: `EC-${String(db.contacts.length + 1).padStart(2, '0')}`
    };
    db.contacts = [...db.contacts, contact];
    notifyChange();
    return contact;
  },

  async updateContact(id: string, patch: Omit<EmergencyContact, 'id' | 'userId'>): Promise<void> {
    await delay(400);
    db.contacts = db.contacts.map((c) => c.id === id ? { ...c, ...patch } : c);
    notifyChange();
  },

  async removeContact(id: string): Promise<void> {
    await delay(320);
    db.contacts = db.contacts.filter((c) => c.id !== id);
    notifyChange();
  }
};