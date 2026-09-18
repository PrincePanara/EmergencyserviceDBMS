import React, { useState } from "react";
import { ClipboardListIcon, DownloadIcon, FileSpreadsheetIcon, FileTextIcon, PackageIcon, TruckIcon, UsersIcon, BoxIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Field";
import { useToast } from "../../contexts/ToastContext";
import { EMERGENCY_TYPES, INCIDENT_STATUSES, PRIORITIES } from "../../types";
import { cn } from "../../utils/cn";
interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  icon: BoxIcon;
  fields: string[];
}
const reports: ReportDefinition[] = [{
  id: 'incident',
  name: 'Incident Report',
  description: 'Every incident with reporter, type, priority, location and final status.',
  icon: ClipboardListIcon,
  fields: ['Incident ID', 'Reported by', 'Type', 'Priority', 'Location', 'Status', 'Reported at']
}, {
  id: 'response',
  name: 'Response Report',
  description: 'Dispatch, arrival and completion times with calculated response duration.',
  icon: TruckIcon,
  fields: ['Incident ID', 'Team', 'Vehicle', 'Dispatch', 'Arrival', 'Response time']
}, {
  id: 'allocation',
  name: 'Resource Allocation Report',
  description: 'Stock committed per incident, returns and consumption.',
  icon: PackageIcon,
  fields: ['Incident ID', 'Resource', 'Allocated', 'Returned', 'Status']
}, {
  id: 'team',
  name: 'Team Performance',
  description: 'Responses handled, average response time and availability per unit.',
  icon: UsersIcon,
  fields: ['Team', 'Type', 'Responses', 'Avg response time', 'Availability']
}, {
  id: 'vehicle',
  name: 'Vehicle Usage',
  description: 'Deployments, maintenance windows and current status for each vehicle.',
  icon: TruckIcon,
  fields: ['Vehicle', 'Type', 'Deployments', 'Status', 'Assigned team']
}, {
  id: 'history',
  name: 'User Emergency History',
  description: 'Per-citizen emergency history for verification and audit.',
  icon: FileTextIcon,
  fields: ['User', 'Phone', 'Incidents', 'Last report', 'Account status']
}];
export function AdminReports() {
  const toast = useToast();
  const [selected, setSelected] = useState<ReportDefinition>(reports[0]);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    type: 'all',
    priority: 'all',
    status: 'all'
  });
  const [exporting, setExporting] = useState<string | null>(null);
  const exportReport = (format: 'PDF' | 'CSV' | 'Excel') => {
    setExporting(format);
    window.setTimeout(() => {
      setExporting(null);
      toast.success(`${selected.name} exported`, `${format} file generated for the selected filters.`);
    }, 900);
  };
  return <div>
      <PageHeader title="Reports" subtitle="Generate operational reports for review, audit and district reporting." />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader title="Report type" subtitle="Choose what to generate" />
          <ul className="divide-y divide-line">
            {reports.map((report) => {
            const active = report.id === selected.id;
            return <li key={report.id}>
                  <button type="button" onClick={() => setSelected(report)} aria-pressed={active} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ease-out', active ? 'bg-primary-light' : 'hover:bg-subtle')}>
                    <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', active ? 'bg-primary text-white' : 'bg-subtle text-muted')}>
                      <report.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className={cn('block text-[14px] font-semibold', active ? 'text-primary-dark' : 'text-ink')}>
                        {report.name}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-5 text-muted">
                        {report.description}
                      </span>
                    </span>
                  </button>
                </li>;
          })}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Filters" subtitle="Applied to the generated export" />
            <div className="space-y-4 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="From date" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({
                ...p,
                from: e.target.value
              }))} />
                <Input label="To date" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({
                ...p,
                to: e.target.value
              }))} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select label="Incident type" value={filters.type} onChange={(e) => setFilters((p) => ({
                ...p,
                type: e.target.value
              }))} options={[{
                value: 'all',
                label: 'All types'
              }, ...EMERGENCY_TYPES.map((t) => ({
                value: t,
                label: t
              }))]} />
                <Select label="Priority" value={filters.priority} onChange={(e) => setFilters((p) => ({
                ...p,
                priority: e.target.value
              }))} options={[{
                value: 'all',
                label: 'All priorities'
              }, ...PRIORITIES.map((p) => ({
                value: p,
                label: p
              }))]} />
                <Select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({
                ...p,
                status: e.target.value
              }))} options={[{
                value: 'all',
                label: 'All statuses'
              }, ...INCIDENT_STATUSES.map((s) => ({
                value: s,
                label: s
              }))]} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title={selected.name} subtitle="Columns included in this report" icon={selected.icon} />
            <div className="p-4 sm:p-5">
              <ul className="flex flex-wrap gap-2">
                {selected.fields.map((field) => <li key={field} className="rounded-md border border-line bg-subtle px-2 py-1 text-[12px] font-medium text-muted">
                    {field}
                  </li>)}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                <Button variant="primary" icon={FileTextIcon} loading={exporting === 'PDF'} onClick={() => exportReport('PDF')}>
                  Export PDF
                </Button>
                <Button icon={DownloadIcon} loading={exporting === 'CSV'} onClick={() => exportReport('CSV')}>
                  Export CSV
                </Button>
                <Button icon={FileSpreadsheetIcon} loading={exporting === 'Excel'} onClick={() => exportReport('Excel')}>
                  Export Excel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>;
}