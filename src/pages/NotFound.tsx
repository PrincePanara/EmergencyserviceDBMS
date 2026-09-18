import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function NotFound() {
  const { user } = useAuth();
  const home = user ? user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard' : '/login';

  return (
    <main className="flex min-h-full items-center justify-center bg-canvas px-4 py-16">
      <div className="max-w-md text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
          <CompassIcon className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          The screen you are looking for does not exist or has moved. Emergency reporting remains
          available from your dashboard.
        </p>
        <Link to={home} className="mt-5 inline-block">
          <Button variant="primary">Back to dashboard</Button>
        </Link>
      </div>
    </main>);

}