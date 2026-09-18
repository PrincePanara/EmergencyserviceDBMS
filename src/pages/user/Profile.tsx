import React, { useState } from 'react';
import { KeyRoundIcon, PencilIcon, ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { userService } from '../../services/userService';
import { formatDate, initials } from '../../utils/format';

export function UserProfile() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
    pincode: user?.pincode ?? ''
  });
  const [passwords, setPasswords] = useState({ current: '', next: '' });

  if (!user) return null;

  const saveProfile = async () => {
    setBusy(true);
    try {
      const updated = await userService.update(user.id, form);
      refresh(updated);
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (err) {
      toast.error('Unable to update profile', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setBusy(true);
    try {
      await userService.changePassword(passwords.current, passwords.next);
      toast.success('Password changed', 'Use your new password the next time you sign in.');
      setPasswordOpen(false);
      setPasswords({ current: '', next: '' });
    } catch (err) {
      toast.error('Unable to change password', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const rows = [
  { label: 'Full name', value: user.name },
  { label: 'Email', value: user.email },
  { label: 'Phone', value: user.phone },
  { label: 'Address', value: user.address || '—' },
  { label: 'City', value: user.city },
  { label: 'State', value: user.state },
  { label: 'Pincode', value: user.pincode || '—' },
  { label: 'Member since', value: formatDate(user.createdAt) }];


  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profile"
        subtitle="Keep your details accurate — response teams use them to reach you."
        actions={
        <>
            <Button icon={KeyRoundIcon} onClick={() => setPasswordOpen(true)}>
              Change password
            </Button>
            <Button variant="primary" icon={PencilIcon} onClick={() => setEditOpen(true)}>
              Edit profile
            </Button>
          </>
        } />
      

      <Card>
        <div className="flex flex-wrap items-center gap-4 border-b border-line p-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink">{user.name}</h2>
            <p className="text-[13px] text-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={user.accountStatus === 'Active' ? 'success' : 'neutral'}>
                <ShieldCheckIcon className="h-3 w-3" aria-hidden />
                Account {user.accountStatus.toLowerCase()}
              </Badge>
              <Badge>ID {user.id}</Badge>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2">
          {rows.map((row) =>
          <div key={row.label} className="border-b border-line px-5 py-3.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{row.label}</dt>
              <dd className="mt-1 text-[14px] font-medium text-ink">{row.value}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        description="Changes apply immediately to new emergency reports."
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={saveProfile}>
              Save changes
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
            <Input label="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
            <Input label="Pincode" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        description="Use at least 8 characters. Passwords are never stored in the browser."
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={changePassword}>
              Update password
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
          
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.next}
            onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} />
          
        </div>
      </Modal>
    </div>);

}