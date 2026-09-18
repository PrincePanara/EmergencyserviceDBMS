import React, { useState } from 'react';
import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/Toolbar';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../hooks/useOperations';
import { notificationService } from '../../services/notificationService';

export function UserNotifications() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useNotifications(user?.id);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [marking, setMarking] = useState(false);

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read);
  const visible = filter === 'unread' ? unread : notifications;

  const markAll = async () => {
    if (!user) return;
    setMarking(true);
    try {
      await notificationService.markAllRead(user.id);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Unable to update notifications');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle="Updates from the control room about your reported emergencies."
        actions={
        <Button
          icon={CheckCheckIcon}
          loading={marking}
          disabled={unread.length === 0}
          onClick={markAll}>
          
            Mark all as read
          </Button>
        } />
      

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <SegmentedControl
            label="Filter notifications"
            value={filter}
            onChange={setFilter}
            options={[
            { value: 'all', label: `All (${notifications.length})` },
            { value: 'unread', label: `Unread (${unread.length})` }]
            } />
          
        </div>

        {error ?
        <ErrorState inline onRetry={reload} /> :
        loading ?
        <div className="p-4">
            <ListSkeleton rows={4} />
          </div> :
        visible.length === 0 ?
        <EmptyState
          icon={BellIcon}
          title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
          description="You will be notified the moment a team is dispatched or a status changes." /> :


        <ul>
            {visible.map((notification) =>
          <NotificationItem
            key={notification.id}
            notification={notification}
            incidentHref={
            notification.incidentId ? `/user/incidents/${notification.incidentId}` : undefined
            }
            onMarkRead={(id) => {
              void notificationService.markRead(id);
            }} />

          )}
          </ul>
        }
      </Card>
    </div>);

}