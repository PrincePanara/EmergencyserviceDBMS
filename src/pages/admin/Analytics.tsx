import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { ActivityIcon, BarChart3Icon, PackageIcon, TimerIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { ChartSkeleton, ErrorState } from '../../components/ui/States';
import { useIncidents } from '../../hooks/useIncidents';
import {
  useAllocations,
  useResources,
  useResponses,
  useTeams,
  useVehicles } from
'../../hooks/useOperations';
import { chartAxis, chartGrid, chartTooltip, seriesColors } from '../../utils/chartTheme';
import { formatMinutes, responseMinutes } from '../../utils/format';
import { indexById, isActiveStatus } from '../../utils/lookup';
import { priorityToken } from '../../utils/statusTokens';

export function AdminAnalytics() {
  const incidents = useIncidents();
  const responses = useResponses();
  const teams = useTeams();
  const vehicles = useVehicles();
  const resources = useResources();
  const allocations = useAllocations();

  const rows = incidents.data ?? [];
  const loading = incidents.loading || responses.loading;

  const byType = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((i) => counts.set(i.type, (counts.get(i.type) ?? 0) + 1));
    return [...counts.entries()].
    map(([name, value]) => ({ name: name.replace(' Emergency', ''), value })).
    sort((a, b) => b.value - a.value);
  }, [rows]);

  const byPriority = useMemo(
    () =>
    (['Critical', 'High', 'Medium', 'Low'] as const).map((priority) => ({
      name: priority,
      value: rows.filter((i) => i.priority === priority).length,
      bars: priorityToken[priority].bars
    })),
    [rows]
  );

  const byStatus = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((i) => counts.set(i.status, (counts.get(i.status) ?? 0) + 1));
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  const overTime = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const count = rows.filter(
        (i) => new Date(i.reportedAt).toDateString() === date.toDateString()
      ).length;
      return { label, incidents: count };
    });
    return days;
  }, [rows]);

  const responseTimes = useMemo(
    () =>
    (responses.data ?? []).
    map((r) => ({
      incident: r.incidentId.replace('INC-', '#'),
      minutes: responseMinutes(r.dispatchTime, r.arrivalTime)
    })).
    filter((r): r is {incident: string;minutes: number;} => r.minutes !== null).
    slice(0, 8).
    reverse(),
    [responses.data]
  );

  const teamUtilisation = useMemo(
    () =>
    (teams.data ?? []).map((team) => ({
      name: team.name.replace('Rajkot ', '').replace(' 01', ''),
      responses: (responses.data ?? []).filter((r) => r.teamId === team.id).length
    })),
    [teams.data, responses.data]
  );

  const vehicleUtilisation = useMemo(
    () =>
    (vehicles.data ?? []).map((vehicle) => ({
      name: vehicle.number.replace('GJ03AB', ''),
      deployments: (responses.data ?? []).filter((r) => r.vehicleId === vehicle.id).length
    })),
    [vehicles.data, responses.data]
  );

  const resourceConsumption = useMemo(() => {
    const resourceMap = indexById(resources.data);
    const counts = new Map<string, number>();
    (allocations.data ?? []).forEach((allocation) => {
      const name = resourceMap[allocation.resourceId]?.name ?? allocation.resourceId;
      counts.set(name, (counts.get(name) ?? 0) + allocation.quantity);
    });
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [allocations.data, resources.data]);

  const avgResponse = useMemo(() => {
    const minutes = (responses.data ?? []).
    map((r) => responseMinutes(r.dispatchTime, r.arrivalTime)).
    filter((m): m is number => m !== null);
    return minutes.length ? Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length) : null;
  }, [responses.data]);

  if (incidents.error) {
    return <ErrorState title="Unable to load analytics" onRetry={incidents.reload} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Emergency Analytics"
        subtitle="Operational performance across incidents, responses and resources." />
      

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total incidents" value={rows.length} icon={BarChart3Icon} />
        <StatCard
          label="Active now"
          value={rows.filter((i) => isActiveStatus(i.status)).length}
          icon={ActivityIcon}
          tone="warning" />
        
        <StatCard label="Average response time" value={formatMinutes(avgResponse)} icon={TimerIcon} />
        <StatCard
          label="Units allocated"
          value={(allocations.data ?? []).reduce((sum, a) => sum + a.quantity, 0)}
          icon={PackageIcon} />
        
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Emergency incidents by type" subtitle="Volume across all recorded incidents" />
          {loading ?
          <ChartSkeleton /> :

          <div className="h-[280px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byType} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 30 }}>
                  <CartesianGrid {...chartGrid} horizontal={false} vertical />
                  <XAxis type="number" {...chartAxis} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" {...chartAxis} width={110} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="value" name="Incidents" fill="rgb(var(--ers-primary))" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        </Card>

        <Card>
          <CardHeader title="Incidents by priority" subtitle="Distribution of triage levels" />
          {loading ?
          <ChartSkeleton /> :

          <div className="h-[280px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                  data={byPriority}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}>
                  
                    {byPriority.map((entry, index) =>
                  <Cell key={entry.name} fill={seriesColors[index % seriesColors.length]} />
                  )}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 12, color: 'rgb(var(--ers-muted))' }}>{value}</span>} />
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          }
        </Card>

        <Card>
          <CardHeader title="Incidents over time" subtitle="Reports received in the last 7 days" />
          {loading ?
          <ChartSkeleton /> :

          <div className="h-[260px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTime} margin={{ top: 4, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid {...chartGrid} />
                  <XAxis dataKey="label" {...chartAxis} />
                  <YAxis {...chartAxis} allowDecimals={false} />
                  <Tooltip {...chartTooltip} />
                  <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="rgb(var(--ers-info))"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: 'rgb(var(--ers-info))' }} />
                
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        </Card>

        <Card>
          <CardHeader title="Response time per incident" subtitle="Minutes from dispatch to arrival" />
          {loading ?
          <ChartSkeleton /> :

          <div className="h-[260px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTimes} margin={{ top: 4, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid {...chartGrid} />
                  <XAxis dataKey="incident" {...chartAxis} />
                  <YAxis {...chartAxis} unit="m" />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="minutes" name="Response time" fill="rgb(var(--ers-warning))" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        </Card>

        <Card>
          <CardHeader title="Team utilisation" subtitle="Responses handled per unit" />
          {loading ?
          <ChartSkeleton /> :

          <div className="h-[260px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamUtilisation} margin={{ top: 4, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid {...chartGrid} />
                  <XAxis dataKey="name" {...chartAxis} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis {...chartAxis} allowDecimals={false} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="responses" name="Responses" fill="rgb(var(--ers-success))" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        </Card>

        <Card>
          <CardHeader title="Vehicle utilisation" subtitle="Deployments per vehicle" />
          {loading ?
          <ChartSkeleton /> :

          <div className="h-[260px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleUtilisation} margin={{ top: 4, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid {...chartGrid} />
                  <XAxis dataKey="name" {...chartAxis} />
                  <YAxis {...chartAxis} allowDecimals={false} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="deployments" name="Deployments" fill="rgb(var(--ers-violet))" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Incidents by status" subtitle="Where open and closed work sits" />
          <ul className="divide-y divide-line">
            {byStatus.map((entry) =>
            <li key={entry.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-32 shrink-0 text-[13px] font-medium text-ink">{entry.name}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-subtle">
                  <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${rows.length ? entry.value / rows.length * 100 : 0}%` }} />
                
                </span>
                <span className="w-8 shrink-0 text-right text-[13px] font-semibold text-ink">{entry.value}</span>
              </li>
            )}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Resource consumption" subtitle="Units allocated to incidents" />
          {resourceConsumption.length === 0 ?
          <p className="px-4 py-8 text-center text-[13px] text-muted">No allocations recorded yet.</p> :

          <ul className="divide-y divide-line">
              {resourceConsumption.map((entry) =>
            <li key={entry.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink">{entry.name}</span>
                  <span className="text-[13px] font-semibold text-muted">{entry.value} units</span>
                </li>
            )}
            </ul>
          }
        </Card>
      </div>
    </div>);

}