import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/** Blocks authenticated users from accessing public auth pages. */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, initialising } = useAuth();

  if (initialising) {
    return (
      <div className="flex min-h-full items-center justify-center bg-canvas">
        <span className="flex items-center gap-2 text-sm font-medium text-muted">
          <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
          Verifying session…
        </span>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return <>{children}</>;
}
