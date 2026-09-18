import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardListIcon, SirenIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { InlineSelect } from '../../components/ui/Field';
import { FilterBar, SearchBar } from '../../components/ui/Toolbar';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Pagination, TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import { EmptyState, ErrorState, ListSkeleton, TableSkeleton } from '../../components/ui/States';
import { IncidentCard } from '../../components/incidents/IncidentCard';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations, useUserIncidents } from '../../hooks/useIncidents';
import { useTeams } from '../../hooks/useOperations';
import { EMERGENCY_TYPES, INCIDENT_STATUSES, PRIORITIES } from '../../types';
import { formatDateTime } from '../../utils/format';
import { indexById } from '../../utils/lookup';

const PAGE_SIZE = 8;

export function MyEmergencies() {
  const { user } = useAuth();
  const incidents = useUserIncidents(user?.id);
  const locations = useLocations();
  const teams = useTeams();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [range, setRange] = useState('all');
  const [page, setPage] = useState(1);

  const locationMap = indexById(locations.data);
  const teamMap = indexById(teams.data);

  const filtered = useMemo(() => {
    const cutoff =
    range === 'all' ?
    0 :
    Date.now() - Number(range) * 24 * 3600_000;
    return (incidents.data ?? []).filter((incident) => {
      const location = locationMap[incident.locationId];
      const haystack = `${incident.code} ${incident.type} ${incident.description} ${location?.address ?? ''}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (type !== 'all' && incident.type !== type) return false;
      if (status !== 'all' && incident.status !== status) return false;
      if (priority !== 'all' && incident.priority !== priority) return false;
      if (cutoff && new Date(incident.reportedAt).getTime() < cutoff) return false;
      return true;
    });
  }, [incidents.data, locationMap, query, type, status, priority, range]);

  const activeFilters = [type, status, priority, range].filter((v) => v !== 'all').length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setType('all');
    setStatus('all');
    setPriority('all');
    setRange('all');
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="My Emergencies"
        subtitle="Every emergency you have reported, with live response status."
        actions={
        <Link to="/user/report-emergency">
            <Button variant="primary" icon={SirenIcon}>
              Report emergency
            </Button>
          </Link>
        } />
      

      <Card>
        <FilterBar activeCount={activeFilters} onReset={resetFilters}>
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search by incident ID, type or location"
            className="min-w-[200px] basis-full sm:basis-auto" />
          
          <InlineSelect
            label="Filter by type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            options={[{ value: 'all', label: 'All types' }, ...EMERGENCY_TYPES.map((t) => ({ value: t, label: t }))]} />
          
          <InlineSelect
            label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[{ value: 'all', label: 'All statuses' }, ...INCIDENT_STATUSES.map((s) => ({ value: s, label: s }))]} />
          
          <InlineSelect
            label="Filter by priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            options={[{ value: 'all', label: 'All priorities' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]} />
          
          <InlineSelect
            label="Filter by date"
            value={range}
            onChange={(e) => {
              setRange(e.target.value);
              setPage(1);
            }}
            options={[
            { value: 'all', label: 'Any date' },
            { value: '1', label: 'Last 24 hours' },
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' }]
            } />
          
        </FilterBar>

        {incidents.error ?
        <ErrorState inline onRetry={incidents.reload} /> :
        incidents.loading ?
        <>
            <div className="hidden md:block">
              <TableSkeleton rows={6} columns={7} />
            </div>
            <div className="p-4 md:hidden">
              <ListSkeleton rows={3} />
            </div>
          </> :
        filtered.length === 0 ?
        <EmptyState
          icon={ClipboardListIcon}
          title="No incidents found"
          description={
          activeFilters || query ?
          'No reports match the current filters. Try clearing them.' :
          'No emergency reports available yet.'
          }
          action={
          activeFilters || query ?
          <Button onClick={resetFilters}>Clear filters</Button> :

          <Link to="/user/report-emergency">
                  <Button variant="primary" icon={SirenIcon}>
                    Report emergency
                  </Button>
                </Link>

          } /> :


        <>
            {/* Table on desktop, cards on mobile */}
            <div className="hidden md:block">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Incident ID</Th>
                    <Th>Type</Th>
                    <Th>Priority</Th>
                    <Th>Status</Th>
                    <Th>Location</Th>
                    <Th>Reported</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((incident) =>
                <Tr key={incident.id} critical={incident.priority === 'Critical'}>
                      <Td className="font-mono text-[12px] font-semibold">{incident.code}</Td>
                      <Td className="font-medium">{incident.type}</Td>
                      <Td>
                        <PriorityBadge priority={incident.priority} />
                      </Td>
                      <Td>
                        <StatusBadge status={incident.status} />
                      </Td>
                      <Td className="max-w-[220px] truncate text-muted">
                        {locationMap[incident.locationId]?.address ?? '—'}
                      </Td>
                      <Td className="whitespace-nowrap text-muted">{formatDateTime(incident.reportedAt)}</Td>
                      <Td className="text-right">
                        <Link
                      to={`/user/incidents/${incident.id}`}
                      className="text-[13px] font-semibold text-primary hover:text-primary-dark">
                      
                          View details
                        </Link>
                      </Td>
                    </Tr>
                )}
                </tbody>
              </TableWrap>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {paged.map((incident) =>
            <IncidentCard
              key={incident.id}
              incident={incident}
              location={locationMap[incident.locationId]}
              team={incident.teamId ? teamMap[incident.teamId] : undefined}
              to={`/user/incidents/${incident.id}`} />

            )}
            </div>

            <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            label="reports" />
          
          </>
        }
      </Card>
    </div>);

}