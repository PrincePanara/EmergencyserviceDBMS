import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

/** Frontend route guard: blocks unauthenticated access and cross-role access. */
export function ProtectedRoute({
  role,
  children



}: {role: Role;children: React.ReactNode;}) {
  const { user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="flex min-h-full items-center justify-center bg-canvas">
        <span className="flex items-center gap-2 text-sm font-medium text-muted">
          <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
          Verifying session…
        </span>
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return <>{children}</>;
}