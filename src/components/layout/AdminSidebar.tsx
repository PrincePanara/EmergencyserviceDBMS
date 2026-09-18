import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import { adminFooterNav, adminNav, type NavItem } from '../../data/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';
import { Brand } from './Brand';

function NavRow({ item, collapsed, onNavigate }: {item: NavItem;collapsed: boolean;onNavigate?: () => void;}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
      cn(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ease-out',
        collapsed && 'justify-center px-0',
        isActive ?
        'bg-primary-light text-primary-dark' :
        'text-muted hover:bg-subtle hover:text-ink'
      )
      }>
      
      {({ isActive }) =>
      <>
          <Icon
          className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-primary' : 'text-muted')}
          aria-hidden />
        
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      }
    </NavLink>);

}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile





}: {collapsed: boolean;onToggleCollapse: () => void;mobileOpen: boolean;onCloseMobile: () => void;}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const body = (onNavigate?: () => void, isCollapsed = false) =>
  <div className="flex h-full flex-col">
      <div
      className={cn(
        'flex h-16 shrink-0 items-center gap-2 border-b border-line px-3',
        isCollapsed && 'justify-center px-0'
      )}>
      
        <Brand compact={isCollapsed} />
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

      <nav aria-label="Admin navigation" className="ers-scroll flex-1 overflow-y-auto px-2 py-3">
        {!isCollapsed &&
      <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Operations
          </p>
      }
        <div className="space-y-0.5">
          {adminNav.map((item) =>
        <NavRow key={item.to} item={item} collapsed={isCollapsed} onNavigate={onNavigate} />
        )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-line px-2 py-3">
        <div className="space-y-0.5">
          {adminFooterNav.map((item) =>
        <NavRow key={item.to} item={item} collapsed={isCollapsed} onNavigate={onNavigate} />
        )}
        </div>
        <div
        className={cn(
          'mt-2 flex items-center gap-2.5 rounded-lg border border-line bg-subtle/60 p-2',
          isCollapsed && 'justify-center border-0 bg-transparent p-0'
        )}>
        
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {initials(user?.name ?? 'Admin')}
          </span>
          {!isCollapsed &&
        <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-[11px] text-muted">Dispatcher · Admin</p>
            </div>
        }
          <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className={cn(
            'rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:bg-primary-light hover:text-primary',
            isCollapsed && 'hidden'
          )}>
          
            <LogOutIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <button
      type="button"
      onClick={onToggleCollapse}
      className="hidden h-10 shrink-0 items-center justify-center gap-2 border-t border-line text-[12px] font-semibold text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink lg:flex">
      
        {isCollapsed ?
      <PanelLeftOpenIcon className="h-4 w-4" aria-hidden /> :

      <>
            <PanelLeftCloseIcon className="h-4 w-4" aria-hidden />
            Collapse
          </>
      }
      </button>
    </div>;


  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden shrink-0 border-r border-line bg-surface transition-[width] duration-200 ease-out lg:block',
          collapsed ? 'w-[68px]' : 'w-[248px]'
        )}>
        
        {body(undefined, collapsed)}
      </aside>

      {mobileOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/45" onClick={onCloseMobile} />
          <aside className="relative h-full w-[268px] border-r border-line bg-surface shadow-pop">
            {body(onCloseMobile, false)}
          </aside>
        </div>
      }
    </>);

}