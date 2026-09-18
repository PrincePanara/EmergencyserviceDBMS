import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'ers.theme';

const systemPrefersDark = (): boolean =>
typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    return stored ?? 'light';
  });

  const resolved: 'light' | 'dark' =
  preference === 'system' ? systemPrefersDark() ? 'dark' : 'light' : preference;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
  }, [preference, resolved]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider.');
  return ctx;
}