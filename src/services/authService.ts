import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AppUser, Role } from '../types';

export interface Credentials {
  email: string;
  password?: string; // Made optional for the type if we only have email
}

export interface RegistrationPayload extends Credentials {
  password?: string;
  name: string;
  phone: string;
  role: Role;
}

const USERS_COLLECTION = 'users';

export const authService = {
  async login(credentials: Credentials): Promise<AppUser> {
    if (!credentials.password) throw new Error('Password is required');
    
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    
    // Fetch user details from Firestore
    const userDocRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User data not found in database');
    }
    
    return {
      id: userCredential.user.uid,
      ...userDocSnap.data()
    } as AppUser;
  },

  async register(payload: RegistrationPayload): Promise<AppUser> {
    if (!payload.password) throw new Error('Password is required');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      payload.email,
      payload.password
    );
    
    const newUser: AppUser = {
      id: userCredential.user.uid,
      role: payload.role || 'user',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: '',
      city: '',
      state: '',
      pincode: '',
      accountStatus: 'Active',
      createdAt: new Date().toISOString()
    };
    
    // Store user data in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
    // Don't save the id inside the document fields if we don't need to, but we can spread the object
    const { id, ...dataToSave } = newUser;
    await setDoc(userDocRef, dataToSave);
    
    return newUser;
  },

  async logout(): Promise<void> {
    await firebaseSignOut(auth);
  },

  // This is replaced by onAuthStateChanged in AuthContext, returning null for now
  restoreSession(): AppUser | null {
    return null;
  }
};