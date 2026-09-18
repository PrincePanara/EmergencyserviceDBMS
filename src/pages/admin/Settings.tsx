import React, { useState } from 'react';
import { BellIcon, LaptopIcon, MoonIcon, ShieldIcon, SlidersHorizontalIcon, SunIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select, Toggle } from '../../components/ui/Field';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, type ThemePreference } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

const themeOptions: Array<{value: ThemePreference;label: string;icon: typeof SunIcon;}> = [
{ value: 'light', label: 'Light', icon: SunIcon },
{ value: 'dark', label: 'Dark', icon: MoonIcon },
{ value: 'system', label: 'System', icon: LaptopIcon }];


export function AdminSettings() {
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    criticalAlerts: true,
    unassignedAlerts: true,
    lowStockAlerts: true,
    dailyDigest: false,
    twoFactor: true
  });
  const [escalation, setEscalation] = useState('5');

  const update = (key: keyof typeof prefs) => (next: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: next }));
    toast.success('Preference saved');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader title="System Settings" subtitle="Control-room preferences for this dispatcher account." />

      <Card>
        <div className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            {initials(user?.name ?? 'Admin')}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink">{user?.name}</h2>
            <p className="text-[13px] text-muted">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="primary">Dispatcher · Admin</Badge>
              <Badge tone="success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                System operational
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Dispatch alerts" icon={BellIcon} />
        <div className="divide-y divide-line px-4 sm:px-5">
          <Toggle
            label="Critical incident alerts"
            description="Alert the control room the moment a critical emergency is reported."
            checked={prefs.criticalAlerts}
            onChange={update('criticalAlerts')} />
          
          <Toggle
            label="Unassigned incident alerts"
            description="Warn when a report stays unassigned beyond the escalation window."
            checked={prefs.unassignedAlerts}
            onChange={update('unassignedAlerts')} />
          
          <Toggle
            label="Low stock alerts"
            description="Notify when any resource falls to or below its minimum stock."
            checked={prefs.lowStockAlerts}
            onChange={update('lowStockAlerts')} />
          
          <Toggle
            label="Daily operations digest"
            description="Email a summary of incidents, responses and resource usage each morning."
            checked={prefs.dailyDigest}
            onChange={update('dailyDigest')} />
          
        </div>
      </Card>

      <Card>
        <CardHeader title="Operations" icon={SlidersHorizontalIcon} />
        <div className="p-4 sm:p-5">
          <Select
            label="Escalation window for unassigned incidents"
            value={escalation}
            onChange={(e) => {
              setEscalation(e.target.value);
              toast.success('Escalation window updated');
            }}
            options={[
            { value: '3', label: '3 minutes' },
            { value: '5', label: '5 minutes' },
            { value: '10', label: '10 minutes' },
            { value: '15', label: '15 minutes' }]
            }
            hint="Critical incidents always escalate immediately." />
          
        </div>
      </Card>

      <Card>
        <CardHeader title="Security" icon={ShieldIcon} />
        <div className="divide-y divide-line px-4 sm:px-5">
          <Toggle
            label="Two-step verification"
            description="Required for accounts with dispatch privileges."
            checked={prefs.twoFactor}
            onChange={update('twoFactor')} />
          
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Control room session</p>
              <p className="mt-0.5 text-[13px] text-muted">District EOC workstation · Rajkot</p>
            </div>
            <Button size="sm" onClick={() => toast.info('Other sessions signed out')}>
              Sign out other devices
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" subtitle="Dark mode is tuned for night-shift monitoring." />
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