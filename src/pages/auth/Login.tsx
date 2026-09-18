import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LogInIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const demoAccounts = [
{ label: 'Citizen demo', email: 'rahul@ers.gov.in' },
{ label: 'Dispatcher demo', email: 'control@ers.gov.in' }];


export function Login() {
  const { login, signingIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('rahul@ers.gov.in');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login({ email, password });
      toast.success('Signed in', `Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  };

  return (
    <AuthLayout
      title="Sign in to continue"
      subtitle="Report emergencies, track responses and coordinate teams from one control system."
      footer={
      <p className="text-[13px] text-muted">
          New to the portal?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
            Create a citizen account
          </Link>
        </p>
      }>
      
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error &&
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary-light px-3 py-2.5">
          
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-[13px] font-medium text-primary-dark">{error}</p>
          </div>
        }

        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)} />
        

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)} />
          
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-[30px] rounded p-1.5 text-muted transition-colors duration-150 ease-out hover:text-ink">
            
            {showPassword ?
            <EyeOffIcon className="h-4 w-4" aria-hidden /> :

            <EyeIcon className="h-4 w-4" aria-hidden />
            }
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30" />
            
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-[13px] font-semibold text-primary hover:text-primary-dark">
            
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" block icon={LogInIcon} loading={signingIn}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-line bg-surface p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Demo accounts — password demo1234
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {demoAccounts.map((account) =>
          <Button
            key={account.email}
            size="sm"
            onClick={() => {
              setEmail(account.email);
              setPassword('demo1234');
            }}>
            
              {account.label}
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>);

}