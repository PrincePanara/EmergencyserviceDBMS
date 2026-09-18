import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import type { LocationRecord } from '../types';
import { notifyChange } from '../data/db';

const LOCATIONS_COL = 'locations';

export const locationService = {
  async list(): Promise<LocationRecord[]> {
    const q = query(collection(firestore, LOCATIONS_COL));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LocationRecord));
  },

  async get(id: string): Promise<LocationRecord | undefined> {
    const docRef = doc(firestore, LOCATIONS_COL, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return undefined;
    return { id: snapshot.id, ...snapshot.data() } as LocationRecord;
  },

  /** Used inside other service transactions; does not emit its own change event. */
  async createSilently(input: Omit<LocationRecord, 'id'>): Promise<LocationRecord> {
    const docRef = await addDoc(collection(firestore, LOCATIONS_COL), input);
    return { id: docRef.id, ...input };
  },

  async create(input: Omit<LocationRecord, 'id'>): Promise<LocationRecord> {
    const record = await this.createSilently(input);
    notifyChange();
    return record;
  },

  async update(id: string, input: Omit<LocationRecord, 'id'>): Promise<void> {
    await updateDoc(doc(firestore, LOCATIONS_COL, id), input as any);
    notifyChange();
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(firestore, LOCATIONS_COL, id));
    notifyChange();
  },

  async detectCurrent(): Promise<Pick<LocationRecord, 'latitude' | 'longitude' | 'address' | 'city' | 'state' | 'pincode'>> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use Nominatim reverse geocoding (OpenStreetMap)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (!response.ok) throw new Error('Reverse geocoding failed');
            
            const data = await response.json();
            const addressObj = data.address || {};
            
            const city = addressObj.city || addressObj.town || addressObj.village || addressObj.county || '';
            const state = addressObj.state || '';
            const pincode = addressObj.postcode || '';
            
            const street = addressObj.road || addressObj.pedestrian || '';
            const neighborhood = addressObj.neighbourhood || addressObj.suburb || '';
            const building = addressObj.house_number ? `${addressObj.house_number}, ` : '';
            const address = [building + street, neighborhood].filter(Boolean).join(', ') || data.display_name || 'Current Location';

            resolve({
              latitude,
              longitude,
              address,
              city,
              state,
              pincode
            });
          } catch (err) {
            // Fallback if reverse geocoding fails, just return coordinates
            resolve({
              latitude,
              longitude,
              address: 'Current Location',
              city: '',
              state: '',
              pincode: ''
            });
          }
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location permission was denied. Please allow location access in your browser.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('The request to get user location timed out.'));
              break;
            default:
              reject(new Error('An unknown error occurred while getting location.'));
              break;
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
};