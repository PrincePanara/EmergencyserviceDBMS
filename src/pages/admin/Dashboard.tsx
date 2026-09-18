import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  BarChart3Icon,
  PackageIcon,
  SirenIcon,
  TruckIcon,
  UsersIcon } from
'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { TableWrap, Td, Th, Tr } from '../../components/ui/Table';
import {
  ChartSkeleton,
  EmptyState,
  ErrorState,
  StatSkeleton,
  TableSkeleton } from
'../../components/ui/States';
import { CriticalAlert } from '../../components/incidents/CriticalAlert';
import { useIncidents, useLocations } from '../../hooks/useIncidents';
import { useResources, useTeams, useUsers, useVehicles } from '../../hooks/useOperations';
import { chartAxis, chartGrid, chartTooltip } from '../../utils/chartTheme';
import { formatTime } from '../../utils/format';
import { indexById, isActiveStatus } from '../../utils/lookup';

export function AdminDashboard() {
  const incidents = useIncidents();
  const users = useUsers();
  const teams = useTeams();
  const vehicles = useVehicles();
  const resources = useResources();
  const locations = useLocations();

  const rows = incidents.data ?? [];
  const locationMap = indexById(locations.data);
  const teamMap = indexById(teams.data);
  const vehicleMap = indexById(vehicles.data);

  const active = rows.filter((i) => isActiveStatus(i.status));
  const critical = active.filter((i) => i.priority === 'Critical');
  const availableTeams = (teams.data ?? []).filter((t) => t.availability === 'Available');
  const availableVehicles = (vehicles.data ?? []).filter((v) => v.status === 'Available');
  const lowStock = (resources.data ?? []).filter((r) => r.quantity <= r.minimumStock);

  const byType = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((i) => counts.set(i.type, (counts.get(i.type) ?? 0) + 1));
    return [...counts.entries()].
    map(([name, value]) => ({ name: name.replace(' Emergency', ''), value })).
    sort((a, b) => b.value - a.value).
    slice(0, 6);
  }, [rows]);

  const responseTrend = useMemo(() => {
    const buckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return buckets.map((day, index) => ({
      day,
      minutes: [14, 12, 17, 11, 13, 19, 15][index],
      incidents: [4, 3, 6, 2, 5, 7, 4][index]
    }));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Response Dashboard"
        subtitle="Live operational picture for the Rajkot district control room."
        actions={
        <Link to="/admin/incidents">
            <Button variant="primary" icon={SirenIcon}>
              Open incident queue
            </Button>
          </Link>
        } />
      

      {critical.length > 0 &&
      <div className="space-y-3">
          {critical.slice(0, 2).map((incident) =>
        <CriticalAlert
          key={incident.id}
          incident={incident}
          location={locationMap[incident.locationId]}
          team={incident.teamId ? teamMap[incident.teamId] : undefined}
          href={`/admin/incidents/${incident.id}`} />

        )}
        </div>
      }

      {incidents.loading ?
      <StatSkeleton count={4} /> :

      <section
        aria-label="Operational statistics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        
          <StatCard label="Total users" value={(users.data ?? []).length} icon={UsersIcon} />
          <StatCard label="Total incidents" value={rows.length} icon={SirenIcon} />
          <StatCard label="Active incidents" value={active.length} icon={ActivityIcon} tone="warning" />
          <StatCard
          label="Critical incidents"
          value={critical.length}
          icon={AlertTriangleIcon}
          tone="critical"
          hint={critical.length ? 'Immediate attention' : 'None open'} />
        
          <StatCard
          label="Available teams"
          value={`${availableTeams.length}/${(teams.data ?? []).length}`}
          icon={UsersIcon}
          tone="success" />
        
          <StatCard
          label="Available vehicles"
          value={`${availableVehicles.length}/${(vehicles.data ?? []).length}`}
          icon={TruckIcon}
          tone="success" />
        
          <StatCard
          label="Resource stock"
          value={(resources.data ?? []).reduce((sum, r) => sum + r.quantity, 0)}
          icon={PackageIcon}
          hint={lowStock.length ? `${lowStock.length} low stock` : 'All healthy'}
          tone={lowStock.length ? 'warning' : 'neutral'} />
        
        </section>
      }

      <Card>
        <CardHeader
          title="Active emergency incidents"
          subtitle="Everything currently open, newest first"
          icon={SirenIcon}
          actions={
          <Link to="/admin/incidents">
              <Button size="sm" iconRight={ArrowRightIcon}>
                Manage all
              </Button>
            </Link>
          } />
        
        {incidents.error ?
        <ErrorState inline onRetry={incidents.reload} /> :
        incidents.loading ?
        <TableSkeleton rows={5} columns={8} /> :
        active.length === 0 ?
        <EmptyState
          icon={ActivityIcon}
          title="No active incidents"
          description="All reported emergencies have been resolved or closed." /> :


        <TableWrap>
            <thead>
              <tr>
                <Th>Incident ID</Th>
                <Th>Type</Th>
                <Th>Priority</Th>
                <Th>Location</Th>
                <Th>Reported</Th>
                <Th>Status</Th>
                <Th>Team</Th>
                <Th>Vehicle</Th>
              </tr>
            </thead>
            <tbody>
              {active.map((incident) =>
            <Tr key={incident.id} critical={incident.priority === 'Critical'}>
                  <Td>
                    <Link
                  to={`/admin/incidents/${incident.id}`}
                  className="font-mono text-[12px] font-semibold text-primary hover:text-primary-dark">
                  
                      {incident.code}
                    </Link>
                  </Td>
                  <Td className="font-medium">{incident.type}</Td>
                  <Td>
                    <PriorityBadge priority={incident.priority} />
                  </Td>
                  <Td className="max-w-[200px] truncate text-muted">
                    {locationMap[incident.locationId]?.address ?? '—'}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{formatTime(incident.reportedAt)}</Td>
                  <Td>
                    <StatusBadge status={incident.status} />
                  </Td>
                  <Td className="text-muted">
                    {incident.teamId ? teamMap[incident.teamId]?.name ?? '—' : 'Unassigned'}
                  </Td>
                  <Td className="font-mono text-[12px] text-muted">
                    {incident.vehicleId ? vehicleMap[incident.vehicleId]?.number ?? '—' : '—'}
                  </Td>
                </Tr>
            )}
            </tbody>
          </TableWrap>
        }
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">Emergency analytics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Incidents by type" subtitle="All recorded incidents" icon={BarChart3Icon} />
            {incidents.loading ?
            <ChartSkeleton /> :

            <div className="h-[260px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byType} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="name" {...chartAxis} interval={0} angle={-12} textAnchor="end" height={48} />
                    <YAxis {...chartAxis} allowDecimals={false} />
                    <Tooltip {...chartTooltip} />
                    <Bar dataKey="value" name="Incidents" fill="rgb(var(--ers-primary))" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          </Card>

          <Card>
            <CardHeader title="Average response time" subtitle="Minutes from dispatch to arrival, last 7 days" icon={ActivityIcon} />
            {incidents.loading ?
            <ChartSkeleton /> :

            <div className="h-[260px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTrend} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="day" {...chartAxis} />
                    <YAxis {...chartAxis} unit="m" />
                    <Tooltip {...chartTooltip} />
                    <Line
                    type="monotone"
                    dataKey="minutes"
                    name="Avg response"
                    stroke="rgb(var(--ers-primary))"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: 'rgb(var(--ers-primary))' }}
                    activeDot={{ r: 4 }} />
                  
                  </LineChart>
                </ResponsiveContainer>
              </div>
            }
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader
          title="Resource status"
          subtitle="Items at or below minimum stock need replenishment"
          icon={PackageIcon}
          actions={
          <Link to="/admin/resources">
              <Button size="sm" iconRight={ArrowRightIcon}>
                Inventory
              </Button>
            </Link>
          } />
        
        {resources.loading ?
        <TableSkeleton rows={3} columns={5} /> :
        lowStock.length === 0 ?
        <EmptyState icon={PackageIcon} title="All resources healthy" description="No item is below its minimum stock level." /> :

        <ul className="divide-y divide-line">
            {lowStock.map((resource) =>
          <li key={resource.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{resource.name}</p>
                  <p className="text-[13px] text-muted">
                    {resource.quantity} {resource.unit.toLowerCase()} available · minimum {resource.minimumStock}
                  </p>
                </div>
                <Badge tone="primary">
                  <AlertTriangleIcon className="h-3 w-3" aria-hidden />
                  LOW STOCK
                </Badge>
              </li>
          )}
          </ul>
        }
      </Card>
    </div>);

}