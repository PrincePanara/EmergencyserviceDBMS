import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../data/navigation';
import { cn } from '../../utils/cn';

/** Bottom navigation for small screens; keeps the emergency action reachable. */
export function MobileNav({ items }: {items: NavItem[];}) {
  const primary = items.filter((item) => item.primary).slice(0, 5);
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-line bg-surface/97 backdrop-blur lg:hidden">
      
      {primary.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors duration-150 ease-out',
              isActive ? 'text-primary' : 'text-muted'
            )
            }>
            
            {({ isActive }) =>
            <>
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} aria-hidden />
                <span className="max-w-[72px] truncate">{item.label.split(' ')[0]}</span>
              </>
            }
          </NavLink>);

      })}
    </nav>);

}