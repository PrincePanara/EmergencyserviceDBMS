import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, CheckCircle2Icon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { authService } from '../../services/authService';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    try {
      await authService.sendPasswordReset(email);
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Unable to send the reset link.');
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email a secure reset link to the address registered with your account."
      footer={
      <p className="text-[13px] text-muted">
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Back to sign in
          </Link>
        </p>
      }>
      
      {status === 'sent' ?
      <div className="rounded-xl border border-success/30 bg-success-light p-4">
          <CheckCircle2Icon className="h-5 w-5 text-success" aria-hidden />
          <h2 className="mt-2 text-[15px] font-semibold text-ink">Reset link sent</h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            If <span className="font-semibold text-ink">{email}</span> matches an account, the reset
            link will arrive within a few minutes. Check your spam folder if you do not see it.
          </p>
        </div> :

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
        
          <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          icon={MailIcon}
          loading={status === 'sending'}>
          
            Send reset link
          </Button>
        </form>
      }
    </AuthLayout>);

}