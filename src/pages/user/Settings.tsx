import React, { useState } from 'react';
import { BellIcon, LaptopIcon, MoonIcon, ShieldIcon, SunIcon, UserIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Field';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, type ThemePreference } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

const themeOptions: Array<{value: ThemePreference;label: string;icon: typeof SunIcon;}> = [
{ value: 'light', label: 'Light', icon: SunIcon },
{ value: 'dark', label: 'Dark', icon: MoonIcon },
{ value: 'system', label: 'System', icon: LaptopIcon }];


export function UserSettings() {
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    email: true,
    emergency: true,
    browser: false,
    twoFactor: false
  });

  const update = (key: keyof typeof prefs) => (next: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: next }));
    toast.success('Preference saved');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader title="Settings" subtitle="Control how the emergency portal communicates with you." />

      <Card>
        <CardHeader title="Account" icon={UserIcon} />
        <dl className="divide-y divide-line">
          {[
          { label: 'Signed in as', value: user?.email ?? '—' },
          { label: 'Account type', value: 'Citizen' },
          { label: 'User ID', value: user?.id ?? '—' }].
          map((row) =>
          <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <dt className="text-[13px] text-muted">{row.label}</dt>
              <dd className="text-[13px] font-semibold text-ink">{row.value}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card>
        <CardHeader title="Notifications" icon={BellIcon} />
        <div className="divide-y divide-line px-4 sm:px-5">
          <Toggle
            label="Email notifications"
            description="Status changes and closure summaries by email."
            checked={prefs.email}
            onChange={update('email')} />
          
          <Toggle
            label="Emergency notifications"
            description="Critical dispatch updates for your active incidents. Recommended."
            checked={prefs.emergency}
            onChange={update('emergency')} />
          
          <Toggle
            label="Browser notifications"
            description="Show desktop alerts while the portal is open."
            checked={prefs.browser}
            onChange={update('browser')} />
          
        </div>
      </Card>

      <Card>
        <CardHeader title="Security" icon={ShieldIcon} />
        <div className="divide-y divide-line px-4 sm:px-5">
          <Toggle
            label="Two-step verification"
            description="Require a one-time code in addition to your password."
            checked={prefs.twoFactor}
            onChange={update('twoFactor')} />
          
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Active sessions</p>
              <p className="mt-0.5 text-[13px] text-muted">This browser · Rajkot, Gujarat</p>
            </div>
            <Button size="sm" onClick={() => toast.info('Other sessions signed out')}>
              Sign out other devices
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" subtitle="Dark mode keeps contrast high for night-shift use." />
        <div className="p-4 sm:p-5">
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const active = preference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPreference(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-[13px] font-semibold transition-colors duration-150 ease-out',
                    active ?
                    'border-primary bg-primary-light text-primary-dark' :
                    'border-line bg-surface text-muted hover:bg-subtle'
                  )}>
                  
                  <option.icon className={cn('h-4 w-4', active && 'text-primary')} aria-hidden />
                  {option.label}
                </button>);

            })}
          </div>
        </div>
      </Card>
    </div>);

}