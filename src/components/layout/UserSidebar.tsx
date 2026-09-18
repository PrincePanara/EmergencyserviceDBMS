import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon, PhoneCallIcon, XIcon } from 'lucide-react';
import { userNav } from '../../data/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';
import { Brand } from './Brand';

export function UserSidebar({
  mobileOpen,
  onCloseMobile



}: {mobileOpen: boolean;onCloseMobile: () => void;}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const body = (onNavigate?: () => void) =>
  <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-3">
        <Brand subtitle="Citizen Portal" />
        {onNavigate &&
      <button
        type="button"
        onClick={onNavigate}
        aria-label="Close navigation"
        className="ml-auto rounded-md p-1.5 text-muted hover:bg-subtle hover:text-ink lg:hidden">
        
            <XIcon className="h-4 w-4" aria-hidden />
          </button>
      }
      </div>

      <nav aria-label="Citizen navigation" className="ers-scroll flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {userNav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ease-out',
              isActive ?
              'bg-primary-light text-primary-dark' :
              'text-muted hover:bg-subtle hover:text-ink'
            )
            }>
            
              {({ isActive }) =>
            <>
                  <Icon
                className={cn('h-[18px] w-[18px]', isActive ? 'text-primary' : 'text-muted')}
                aria-hidden />
              
                  <span className="truncate">{item.label}</span>
                </>
            }
            </NavLink>);

      })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-3">
        <div className="rounded-lg border border-primary/25 bg-primary-light p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-dark">
            <PhoneCallIcon className="h-3.5 w-3.5" aria-hidden />
            Emergency helpline
          </p>
          <p className="mt-1 text-lg font-bold leading-none text-primary-dark">112</p>
          <p className="mt-1 text-[11px] text-primary-dark/80">
            Call directly for life-threatening emergencies.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-line bg-subtle/60 p-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {initials(user?.name ?? 'User')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-[11px] text-muted">Citizen account</p>
          </div>
          <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:bg-primary-light hover:text-primary">
          
            <LogOutIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>;


  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-line bg-surface lg:block">
        {body()}
      </aside>
      {mobileOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/45" onClick={onCloseMobile} />
          <aside className="relative h-full w-[268px] border-r border-line bg-surface shadow-pop">
            {body(onCloseMobile)}
          </aside>
        </div>
      }
    </>);

}