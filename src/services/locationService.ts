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

  /**
   * Reverse geocodes coordinates to a human-readable address with city, state, and pincode.
   * Multi-provider: Photon (OSM) -> BigDataCloud -> OpenStreetMap -> Fallback coordinates.
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<Pick<LocationRecord, 'latitude' | 'longitude' | 'address' | 'city' | 'state' | 'pincode'>> {
    // Provider 1: Photon (Komoot OpenStreetMap)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const p = data.features?.[0]?.properties;
        if (p) {
          const parts: string[] = [];
          if (p.housenumber) parts.push(p.housenumber);
          if (p.name) parts.push(p.name);
          if (p.street && p.street !== p.name) parts.push(p.street);
          if (p.district && !parts.includes(p.district)) parts.push(p.district);

          const address = parts.join(', ') || p.name || p.street || '';
          const rawCity = p.city || p.town || p.village || p.county || '';
          const city = rawCity.replace(/ West taluka| Taluka| District/gi, '').trim() || 'Rajkot';
          const state = p.state || 'Gujarat';
          const pincode = p.postcode || '';

          if (address) {
            return { address, city, state, pincode, latitude, longitude };
          }
        }
      }
    } catch {
      // Fall through to next provider
    }

    // Provider 2: BigDataCloud Free Client Reverse Geocoding
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (res.ok) {
        const d = await res.json();
        const city = d.city || d.locality || 'Rajkot';
        const state = d.principalSubdivision || 'Gujarat';
        const pincode = d.postcode || '';
        const adminList = (d.localityInfo?.administrative || []).map((a: { name?: string }) => a.name).filter(Boolean);
        const area = adminList.length > 2 ? adminList.slice(-2).join(', ') : d.locality || city;
        const address = area || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        return { address, city, state, pincode, latitude, longitude };
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback if network/geocoding fails
    return {
      address: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Rajkot',
      state: 'Gujarat',
      pincode: '',
      latitude,
      longitude
    };
  },

  /**
   * Fast IP-based geolocation fallback when GPS/browser permission is not available.
   */
  async fetchIpLocation(): Promise<Pick<LocationRecord, 'latitude' | 'longitude' | 'address' | 'city' | 'state' | 'pincode'>> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en', {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const d = await res.json();
        const lat = Number(d.latitude) || 22.2823;
        const lon = Number(d.longitude) || 70.7688;
        const city = d.city || d.locality || 'Rajkot';
        const state = d.principalSubdivision || 'Gujarat';
        const pincode = d.postcode || '';
        const adminList = (d.localityInfo?.administrative || []).map((a: { name?: string }) => a.name).filter(Boolean);
        const address = adminList.length > 2 ? adminList.slice(-2).join(', ') : d.locality || city;
        return {
          address: address || 'Current Area',
          city,
          state,
          pincode,
          latitude: lat,
          longitude: lon
        };
      }
    } catch {
      // ignore
    }

    return {
      address: 'Kalawad Road',
      city: 'Rajkot',
      state: 'Gujarat',
      pincode: '360005',
      latitude: 22.2823,
      longitude: 70.7688
    };
  },

  /**
   * Detects current user GPS location, requests browser permission, and auto reverse-geocodes.
   * If browser GPS fails or permission denied, falls back to IP geolocation.
   */
  async detectCurrent(options?: {
    allowIpFallback?: boolean;
    highAccuracy?: boolean;
    timeoutMs?: number;
  }): Promise<Pick<LocationRecord, 'latitude' | 'longitude' | 'address' | 'city' | 'state' | 'pincode'>> {
    const allowIpFallback = options?.allowIpFallback ?? true;

    if (!navigator.geolocation) {
      if (allowIpFallback) return this.fetchIpLocation();
      throw new Error('Geolocation is not supported by your browser.');
    }

    const getPosition = (enableHighAccuracy: boolean, timeout: number): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy,
          timeout,
          maximumAge: 30000
        });
      });
    };

    try {
      // First attempt: High accuracy GPS
      let position: GeolocationPosition;
      try {
        position = await getPosition(options?.highAccuracy ?? true, options?.timeoutMs ?? 7000);
      } catch (err: any) {
        // If high accuracy timed out, retry with standard accuracy
        if (err?.code === 3 /* TIMEOUT */ || err?.code === 2 /* POSITION_UNAVAILABLE */) {
          position = await getPosition(false, 4000);
        } else {
          throw err;
        }
      }

      const { latitude, longitude } = position.coords;
      return await this.reverseGeocode(latitude, longitude);
    } catch (error: any) {
      if (allowIpFallback) {
        try {
          return await this.fetchIpLocation();
        } catch {
          // continue to throw descriptive error below
        }
      }

      switch (error?.code) {
        case 1: // PERMISSION_DENIED
          throw new Error('Location permission was denied. Please allow location access in your browser.');
        case 2: // POSITION_UNAVAILABLE
          throw new Error('Location information is unavailable. Please check your GPS or internet connection.');
        case 3: // TIMEOUT
          throw new Error('The request to get user location timed out.');
        default:
          throw new Error(error?.message || 'Unable to retrieve your location.');
      }
    }
  }
};