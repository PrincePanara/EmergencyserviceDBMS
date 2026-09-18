import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminNav, pageTitles, userNav } from '../../data/navigation';
import { AdminSidebar } from './AdminSidebar';
import { CommandPalette } from './CommandPalette';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { UserSidebar } from './UserSidebar';
import { cn } from '../../utils/cn';

function resolveTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/admin/incidents/')) return 'Incident Control';
  if (pathname.startsWith('/user/incidents/')) return 'Emergency Details';
  return 'Emergency Response';
}

export function AppShell({ variant }: {variant: 'user' | 'admin';}) {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isAdmin = variant === 'admin';
  const base = isAdmin ? '/admin' : '/user';

  return (
    <div className="min-h-full bg-canvas">
      {isAdmin ?
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)} /> :


      <UserSidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      }

      <div
        className={cn(
          'flex min-h-full flex-col transition-[padding] duration-200 ease-out',
          isAdmin ? collapsed ? 'lg:pl-[68px]' : 'lg:pl-[248px]' : 'lg:pl-[248px]'
        )}>
        
        <Header
          title={resolveTitle(location.pathname)}
          onOpenNav={() => setMobileNavOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          notificationsHref={`${base}/notifications`}
          profileHref={isAdmin ? '/admin/settings' : '/user/profile'}
          settingsHref={`${base}/settings`} />
        

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto w-full max-w-[1440px] flex-1 px-3 pb-24 pt-5 sm:px-5 lg:pb-8">
          
          <Outlet />
        </motion.main>
      </div>

      <MobileNav items={isAdmin ? adminNav : userNav} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>);

}