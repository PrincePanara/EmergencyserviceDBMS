import React, { useState } from 'react';
import { PencilIcon, PhoneIcon, PlusIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useEmergencyContacts } from '../../hooks/useOperations';
import { userService } from '../../services/userService';
import type { EmergencyContact } from '../../types';

export function EmergencyContacts() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useEmergencyContacts(user?.id);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<EmergencyContact | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '' });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', relationship: '', phone: '' });
    setFormOpen(true);
  };

  const openEdit = (contact: EmergencyContact) => {
    setEditing(contact);
    setForm({ name: contact.name, relationship: contact.relationship, phone: contact.phone });
    setFormOpen(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.phone.trim()) {
      toast.warning('Missing details', 'Name and phone number are required.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await userService.updateContact(editing.id, form);
        toast.success('Contact updated');
      } else {
        await userService.addContact({ ...form, userId: user.id });
        toast.success('Contact added');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Unable to save contact', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await userService.removeContact(deleting.id);
      toast.success('Contact deleted');
      setDeleting(null);
    } catch {
      toast.error('Unable to delete contact');
    } finally {
      setBusy(false);
    }
  };

  const contacts = data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Emergency Contacts"
        subtitle="People the response team can reach if you are unable to answer."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openCreate}>
            Add contact
          </Button>
        } />
      

      {error ?
      <ErrorState onRetry={reload} /> :
      loading ?
      <ListSkeleton rows={3} /> :
      contacts.length === 0 ?
      <Card>
          <EmptyState
          icon={UserPlusIcon}
          title="No emergency contacts"
          description="Add at least one contact so teams can reach someone close to you during an emergency."
          action={
          <Button variant="primary" icon={PlusIcon} onClick={openCreate}>
                Add contact
              </Button>
          } />
        
        </Card> :

      <ul className="space-y-3">
          {contacts.map((contact) =>
        <li key={contact.id}>
              <Card className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <PhoneIcon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">{contact.name}</p>
                  <p className="text-[13px] text-muted">
                    {contact.relationship || 'Contact'} · {contact.phone}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconButton icon={PencilIcon} label={`Edit ${contact.name}`} onClick={() => openEdit(contact)} />
                  <IconButton
                icon={Trash2Icon}
                label={`Delete ${contact.name}`}
                onClick={() => setDeleting(contact)}
                className="hover:border-primary/40 hover:bg-primary-light hover:text-primary" />
              
                </div>
              </Card>
            </li>
        )}
        </ul>
      }

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit contact' : 'Add emergency contact'}
        description="This person may be contacted by the response team during an active emergency."
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={busy} onClick={save}>
              {editing ? 'Save changes' : 'Add contact'}
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Meena Patel" />
          
          <Input
            label="Relationship"
            value={form.relationship}
            onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))}
            placeholder="Mother, spouse, neighbour…" />
          
          <Input
            label="Phone number"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98250 11224" />
          
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        icon={Trash2Icon}
        title={`Delete ${deleting?.name ?? 'contact'}?`}
        description="This contact will no longer be available to response teams."
        confirmLabel="Delete contact" />
      
    </div>);

}