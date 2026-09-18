import React from 'react';
import { ActivityIcon, ClockIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { Brand } from './Brand';

const assurances = [
{ icon: ClockIcon, title: 'Average dispatch under 3 minutes', copy: 'Reports reach the district control room the moment they are submitted.' },
{ icon: UsersIcon, title: '5 response units on standby', copy: 'Fire, medical, police, rescue and disaster management teams.' },
{ icon: ShieldCheckIcon, title: 'Verified and auditable', copy: 'Every status change is timestamped against the incident record.' }];


export function AuthLayout({
  title,
  subtitle,
  children,
  footer





}: {title: string;subtitle: string;children: React.ReactNode;footer?: React.ReactNode;}) {
  return (
    <div className="grid min-h-full grid-cols-1 bg-canvas lg:grid-cols-[1.05fr_1fr]">
      {/* Operational context panel — desktop only */}
      <aside className="relative hidden flex-col justify-between bg-primary-deep p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <ActivityIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-5">Emergency Response</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
              Rajkot District Control
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            Control room operational
          </p>
          <h2 className="mt-5 text-[34px] font-bold leading-[1.15] tracking-tight">
            One system from the first call to case closure.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-white/80">
            Citizens report emergencies in seconds. Dispatchers assign teams, vehicles and
            resources, then track every response against the incident timeline.
          </p>

          <dl className="mt-9 space-y-5 border-t border-white/15 pt-7">
            {assurances.map((item) =>
            <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <dt className="text-sm font-semibold">{item.title}</dt>
                  <dd className="mt-0.5 text-[13px] leading-5 text-white/70">{item.copy}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        <p className="text-[12px] text-white/60">
          For life-threatening emergencies always call <span className="font-bold text-white">112</span>.
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden">
            <Brand />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink lg:mt-0">{title}</h1>
          <p className="mt-1.5 text-sm leading-6 text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-line pt-5">{footer}</div>}
        </div>
      </main>
    </div>);

}