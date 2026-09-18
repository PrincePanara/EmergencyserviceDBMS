import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon } from
'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useOperations';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

export function Header({
  title,
  onOpenNav,
  onOpenSearch,
  notificationsHref,
  profileHref,
  settingsHref







}: {title: string;onOpenNav: () => void;onOpenSearch: () => void;notificationsHref: string;profileHref: string;settingsHref: string;}) {
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications(user?.id);
  const unread = (notifications ?? []).filter((n) => !n.read).length;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:px-5">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink lg:hidden">
        
        <MenuIcon className="h-4 w-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold text-ink sm:text-base">{title}</h1>
        <p className="hidden items-center gap-1.5 text-[11px] font-medium text-muted sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          System Operational
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-left text-[13px] text-muted transition-colors duration-150 ease-out hover:bg-subtle md:flex">
        
        <SearchIcon className="h-4 w-4" aria-hidden />
        <span className="flex-1 truncate">Search incidents, teams…</span>
        <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Open search"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink md:hidden">
        
        <SearchIcon className="h-4 w-4" aria-hidden />
      </button>

      <Link
        to={notificationsHref}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink">
        
        <BellIcon className="h-4 w-4" aria-hidden />
        {unread > 0 &&
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        }
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-2 transition-colors duration-150 ease-out hover:bg-subtle">
          
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {initials(user?.name ?? 'User')}
          </span>
          <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-ink sm:block">
            {user?.name.split(' ')[0]}
          </span>
        </button>

        {menuOpen &&
        <div
          role="menu"
          className="absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
          
            <div className="border-b border-line px-3 py-2.5">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-[11px] text-muted">{user?.email}</p>
            </div>
            {[
          { label: 'Profile', to: profileHref, icon: UserIcon },
          { label: 'Settings', to: settingsHref, icon: SettingsIcon }].
          map((item) =>
          <Link
            key={item.to}
            to={item.to}
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-ink transition-colors duration-150 ease-out hover:bg-subtle">
            
                <item.icon className="h-4 w-4 text-muted" aria-hidden />
                {item.label}
              </Link>
          )}
            <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-2 border-t border-line px-3 py-2 text-[13px] font-semibold text-primary',
              'transition-colors duration-150 ease-out hover:bg-primary-light'
            )}>
            
              <LogOutIcon className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </div>
        }
      </div>
    </header>);

}