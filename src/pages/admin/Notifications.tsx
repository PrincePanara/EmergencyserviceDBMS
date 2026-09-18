import React, { useMemo, useState } from 'react';
import { BellIcon, SendIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { SearchBar } from '../../components/ui/Toolbar';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { useToast } from '../../contexts/ToastContext';
import { useIncidents } from '../../hooks/useIncidents';
import { useAllNotifications, useUsers } from '../../hooks/useOperations';
import { notificationService } from '../../services/notificationService';
import { indexById } from '../../utils/lookup';

const templates = [
{ title: 'Team dispatched', message: 'An emergency response team has been dispatched to your location.' },
{ title: 'Emergency team has arrived', message: 'The response team is now on scene and handling the emergency.' },
{ title: 'Incident resolved', message: 'The emergency has been resolved. The incident will be closed shortly.' },
{ title: 'Additional information required', message: 'Please provide more details about the situation so we can respond accurately.' }];


export function AdminNotifications() {
  const notifications = useAllNotifications();
  const users = useUsers();
  const incidents = useIncidents();
  const toast = useToast();

  const [form, setForm] = useState({ userId: '', incidentId: '', title: '', message: '' });
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const userMap = indexById(users.data);
  const history = useMemo(
    () =>
    (notifications.data ?? []).filter((n) => {
      const haystack = `${n.title} ${n.message} ${n.incidentId ?? ''} ${userMap[n.userId]?.name ?? ''}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    }),
    [notifications.data, userMap, query]
  );

  const send = async () => {
    if (!form.userId || !form.title.trim() || !form.message.trim()) {
      toast.warning('Missing details', 'Select a recipient and write a title and message.');
      return;
    }
    setBusy(true);
    try {
      await notificationService.send({
        userId: form.userId,
        incidentId: form.incidentId || undefined,
        title: form.title.trim(),
        message: form.message.trim(),
        kind: 'info'
      });
      toast.success('Notification sent', `Delivered to ${userMap[form.userId]?.name ?? 'the user'}.`);
      setForm({ userId: '', incidentId: '', title: '', message: '' });
    } catch {
      toast.error('Unable to send notification');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notification Centre"
        subtitle="Send targeted updates to citizens and review everything the system has dispatched." />
      

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.25fr]">
        <Card>
          <CardHeader title="Send notification" icon={SendIcon} />
          <div className="space-y-4 p-4 sm:p-5">
            <Select
              label="Recipient"
              required
              placeholder="Select a user"
              value={form.userId}
              onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
              options={(users.data ?? []).map((u) => ({ value: u.id, label: `${u.name} · ${u.phone}` }))} />
            
            <Select
              label="Related incident"
              placeholder="No specific incident"
              value={form.incidentId}
              onChange={(e) => setForm((p) => ({ ...p, incidentId: e.target.value }))}
              options={(incidents.data ?? []).
              filter((i) => !form.userId || i.userId === form.userId).
              map((i) => ({ value: i.id, label: `${i.code} · ${i.type}` }))} />
            
            <Input
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Team dispatched" />
            
            <Textarea
              label="Message"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Write a short, factual update." />
            

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Quick templates
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {templates.map((template) =>
                <Button
                  key={template.title}
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, title: template.title, message: template.message }))}>
                  
                    {template.title}
                  </Button>
                )}
              </div>
            </div>

            <Button variant="primary" block icon={SendIcon} loading={busy} onClick={send}>
              Send notification
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Notification history"
            icon={BellIcon}
            subtitle={`${history.length} records`} />
          
          <div className="border-b border-line px-4 py-3">
            <SearchBar value={query} onChange={setQuery} placeholder="Search notifications" />
          </div>
          {notifications.error ?
          <ErrorState inline onRetry={notifications.reload} /> :
          notifications.loading ?
          <div className="p-4">
              <ListSkeleton rows={4} />
            </div> :
          history.length === 0 ?
          <EmptyState icon={BellIcon} title="No notifications" description="Nothing has been dispatched yet." /> :

          <ul className="ers-scroll max-h-[620px] overflow-y-auto">
              {history.map((notification) =>
            <NotificationItem
              key={notification.id}
              notification={notification}
              incidentHref={
              notification.incidentId ? `/admin/incidents/${notification.incidentId}` : undefined
              } />

            )}
            </ul>
          }
        </Card>
      </div>
    </div>);

}