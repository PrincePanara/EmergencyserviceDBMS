import React, { useMemo, useState } from 'react';
import { BanIcon, CheckCircle2Icon, Trash2Icon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { InlineSelect } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { Badge } from '../../components/ui/Badge';
import { Pagination, TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';
import { useIncidents } from '../../hooks/useIncidents';
import { useUsers } from '../../hooks/useOperations';
import { userService } from '../../services/userService';
import type { AppUser } from '../../types';
import { formatDate, initials } from '../../utils/format';

const PAGE_SIZE = 8;

export function AdminUsers() {
  const users = useUsers();
  const incidents = useIncidents();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AppUser | null>(null);
  const [toggling, setToggling] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
    (users.data ?? []).filter((user) => {
      const haystack = `${user.id} ${user.name} ${user.email} ${user.phone} ${user.city}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (status !== 'all' && user.accountStatus !== status) return false;
      return true;
    }),
    [users.data, query, status]
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const incidentCount = (userId: string) =>
  (incidents.data ?? []).filter((i) => i.userId === userId).length;

  const toggleStatus = async () => {
    if (!toggling) return;
    setBusy(true);
    try {
      const next = toggling.accountStatus === 'Active' ? 'Disabled' : 'Active';
      await userService.setAccountStatus(toggling.id, next);
      toast.success(`Account ${next.toLowerCase()}`, `${toggling.name} can ${next === 'Active' ? 'now' : 'no longer'} sign in.`);
      setToggling(null);
    } catch {
      toast.error('Unable to update account');
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await userService.remove(deleting.id);
      toast.success('User deleted', `${deleting.name} was removed from the system.`);
      setDeleting(null);
    } catch {
      toast.error('Unable to delete user');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Citizen accounts registered with the emergency response portal."
        meta={
        <span className="rounded-md border border-line bg-subtle px-2 py-0.5 text-xs font-semibold text-muted">
            {filtered.length} accounts
          </span>
        } />
      

      <Card>
        <FilterBar activeCount={status !== 'all' ? 1 : 0} onReset={() => setStatus('all')}>
          <SearchBar
            value={query}
            onChange={(v) => {setQuery(v);setPage(1);}}
            placeholder="Search by name, email, phone or user ID"
            className="min-w-[200px]" />
          
          <InlineSelect
            label="Account status"
            value={status}
            onChange={(e) => {setStatus(e.target.value);setPage(1);}}
            options={[
            { value: 'all', label: 'All accounts' },
            { value: 'Active', label: 'Active' },
            { value: 'Disabled', label: 'Disabled' }]
            } />
          
        </FilterBar>

        {users.error ?
        <ErrorState inline onRetry={users.reload} /> :
        users.loading ?
        <TableSkeleton rows={6} columns={8} /> :
        filtered.length === 0 ?
        <EmptyState icon={UsersIcon} title="No users found" description="No account matches the current search." /> :

        <>
            <TableWrap>
              <thead>
                <tr>
                  <Th>User ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>City</Th>
                  <Th>Reports</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((user) =>
              <Tr key={user.id}>
                    <Td className="font-mono text-[12px] font-semibold">{user.id}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-[10px] font-bold text-muted">
                          {initials(user.name)}
                        </span>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </Td>
                    <Td className="text-muted">{user.email}</Td>
                    <Td className="whitespace-nowrap text-muted">{user.phone}</Td>
                    <Td className="text-muted">{user.city}</Td>
                    <Td>{incidentCount(user.id)}</Td>
                    <Td>
                      <Badge tone={user.accountStatus === 'Active' ? 'success' : 'neutral'}>
                        {user.accountStatus}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-muted">{formatDate(user.createdAt)}</Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" onClick={() => setViewing(user)}>
                          View
                        </Button>
                        <Button
                      size="sm"
                      icon={user.accountStatus === 'Active' ? BanIcon : CheckCircle2Icon}
                      onClick={() => setToggling(user)}>
                      
                          {user.accountStatus === 'Active' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2Icon} onClick={() => setDeleting(user)}>
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </Tr>
              )}
              </tbody>
            </TableWrap>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} label="users" />
          </>
        }
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? 'User'}
        description={`${viewing?.id} · registered ${formatDate(viewing?.createdAt)}`}
        footer={
        <Button variant="secondary" data-close onClick={() => setViewing(null)}>
            Close
          </Button>
        }>
        
        <dl className="divide-y divide-line">
          {[
          { label: 'Email', value: viewing?.email },
          { label: 'Phone', value: viewing?.phone },
          { label: 'Address', value: viewing?.address || '—' },
          { label: 'City', value: viewing?.city },
          { label: 'State', value: viewing?.state },
          { label: 'Pincode', value: viewing?.pincode || '—' },
          { label: 'Account status', value: viewing?.accountStatus },
          { label: 'Emergencies reported', value: viewing ? incidentCount(viewing.id) : 0 }].
          map((row) =>
          <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-[13px] text-muted">{row.label}</dt>
              <dd className="text-[13px] font-semibold text-ink">{row.value}</dd>
            </div>
          )}
        </dl>
      </Modal>

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={toggleStatus}
        loading={busy}
        destructive={toggling?.accountStatus === 'Active'}
        title={`${toggling?.accountStatus === 'Active' ? 'Disable' : 'Enable'} ${toggling?.name ?? 'account'}?`}
        description={
        toggling?.accountStatus === 'Active' ?
        'The user will be signed out and unable to report new emergencies.' :
        'The user will regain access to the citizen portal.'
        }
        confirmLabel={toggling?.accountStatus === 'Active' ? 'Disable account' : 'Enable account'} />
      

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={removeUser}
        loading={busy}
        icon={Trash2Icon}
        title={`Delete ${deleting?.name ?? 'user'}?`}
        description="This permanently removes the account and its emergency contacts. Incident records are retained for audit."
        confirmLabel="Delete user" />
      
    </div>);

}