import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { authService, type Credentials, type RegistrationPayload } from '../services/authService';
import type { AppUser } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  initialising: boolean;
  signingIn: boolean;
  login: (credentials: Credentials) => Promise<AppUser>;
  register: (payload: RegistrationPayload) => Promise<AppUser>;
  logout: () => Promise<void>;
  refresh: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser({
              id: firebaseUser.uid,
              ...userDocSnap.data()
            } as AppUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setInitialising(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    setSigningIn(true);
    try {
      const signedIn = await authService.login(credentials);
      // setUser is handled by onAuthStateChanged, but we can set it here for immediate feedback
      setUser(signedIn);
      return signedIn;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const register = useCallback(async (payload: RegistrationPayload) => {
    setSigningIn(true);
    try {
      const created = await authService.register(payload);
      setUser(created);
      return created;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    // setUser(null) handled by onAuthStateChanged
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, initialising, signingIn, login, register, logout, refresh: setUser }),
    [user, initialising, signingIn, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider.');
  return ctx;
}