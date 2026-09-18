import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, UserPlusIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export function Register() {
  const { register, signingIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Rajkot',
    state: 'Gujarat',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.trim().length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    try {
      await register(form);
      toast.success('Account created', 'You can now report emergencies from your dashboard.');
      navigate('/user/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the account.');
    }
  };

  return (
    <AuthLayout
      title="Create a citizen account"
      subtitle="Registration lets the control room verify your reports and keep you updated on every response."
      footer={
      <p className="text-[13px] text-muted">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Sign in instead
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

        <Input label="Full name" required value={form.name} onChange={set('name')} placeholder="Rahul Patel" />
        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com" />
        
        <Input
          label="Mobile number"
          type="tel"
          required
          value={form.phone}
          onChange={set('phone')}
          placeholder="+91 98250 11223"
          hint="Used by response teams to reach you on scene." />
        
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" required value={form.city} onChange={set('city')} />
          <Input label="State" required value={form.state} onChange={set('state')} />
        </div>
        <Input
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          hint="Minimum 8 characters." />
        

        <Button type="submit" variant="primary" size="lg" block icon={UserPlusIcon} loading={signingIn}>
          Create account
        </Button>
      </form>
    </AuthLayout>);

}