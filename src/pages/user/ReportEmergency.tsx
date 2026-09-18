import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CrosshairIcon,
  PhoneCallIcon,
  SirenIcon } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { MapPreview } from '../../components/ui/MapPreview';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { incidentService } from '../../services/incidentService';
import { locationService } from '../../services/locationService';
import { EMERGENCY_TYPES, PRIORITIES, type Incident } from '../../types';
import { formatDateTime } from '../../utils/format';

interface FormState {
  type: string;
  priority: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  contactName: string;
  contactPhone: string;
}

const initialForm: FormState = {
  type: '',
  priority: 'High',
  description: '',
  address: '',
  city: 'Rajkot',
  state: 'Gujarat',
  pincode: '',
  latitude: '',
  longitude: '',
  contactName: '',
  contactPhone: ''
};

export function ReportEmergency() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [created, setCreated] = useState<Incident | null>(null);

  const set = (key: keyof FormState, value: string) =>
  setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.type) next.type = 'Select the type of emergency.';
    if (!form.priority) next.priority = 'Select a priority.';
    if (form.description.trim().length < 15)
    next.description = 'Describe the situation in at least 15 characters.';
    if (!form.address.trim()) next.address = 'Address is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.state.trim()) next.state = 'State is required.';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) next.pincode = 'Pincode must be 6 digits.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const position = await locationService.detectCurrent();
      setForm((prev) => ({
        ...prev,
        address: position.address,
        city: position.city,
        state: position.state,
        pincode: position.pincode,
        latitude: String(position.latitude),
        longitude: String(position.longitude)
      }));
      toast.success('Location captured', 'Coordinates attached to this report.');
    } catch (err) {
      toast.error('Unable to get location', err instanceof Error ? err.message : 'Enter the address manually so teams can reach you.');
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setConfirmOpen(true);else
    toast.warning('Check the form', 'Some required details are missing or invalid.');
  };

  const confirmReport = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const incident = await incidentService.create({
        userId: user.id,
        type: form.type as Incident['type'],
        priority: form.priority as Incident['priority'],
        description: form.description.trim(),
        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          latitude: Number(form.latitude) || 22.3039,
          longitude: Number(form.longitude) || 70.8022
        },
        contactName: form.contactName.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined
      });
      setConfirmOpen(false);
      setCreated(incident);
      toast.success('Emergency reported', `${incident.code} is now with the control room.`);
    } catch (err) {
      toast.error('Unable to report emergency', err instanceof Error ? err.message : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="border-b border-line bg-success-light px-5 py-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
              <CheckCircle2Icon className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Emergency reported</h1>
            <p className="mt-1.5 text-sm leading-6 text-muted">
              The control room has received your report and is assigning a response team. You will be
              notified at every status change.
            </p>
          </div>

          <dl className="divide-y divide-line">
            {[
            { label: 'Incident ID', value: <span className="font-mono font-semibold">{created.code}</span> },
            { label: 'Reported time', value: formatDateTime(created.reportedAt) },
            { label: 'Emergency type', value: created.type },
            { label: 'Priority', value: <PriorityBadge priority={created.priority} /> },
            { label: 'Location', value: `${form.address}, ${form.city} ${form.pincode}` },
            { label: 'Current status', value: <StatusBadge status={created.status} /> }].
            map((row) =>
            <div key={row.label} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <dt className="text-[13px] font-medium text-muted">{row.label}</dt>
                <dd className="text-[13px] font-semibold text-ink">{row.value}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
            <Button variant="primary" onClick={() => navigate(`/user/incidents/${created.id}`)}>
              Track this emergency
            </Button>
            <Button
              onClick={() => {
                setCreated(null);
                setForm(initialForm);
              }}>
              
              Report another
            </Button>
            <Link to="/user/dashboard" className="ml-auto">
              <Button variant="ghost">Back to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>);

  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Report an Emergency"
        subtitle="Provide accurate information so our response team can act quickly."
        backTo="/user/dashboard"
        backLabel="Dashboard" />
      

      <div
        role="note"
        className="mb-4 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary-light px-4 py-3">
        
        <PhoneCallIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-[13px] leading-5 text-primary-dark">
          If life is in immediate danger, call <span className="font-bold">112</span> first, then
          submit this report so the control room has the written record.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Card>
          <CardHeader title="Emergency details" icon={AlertTriangleIcon} />
          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Emergency type"
                required
                placeholder="Select emergency type"
                value={form.type}
                error={errors.type}
                onChange={(e) => set('type', e.target.value)}
                options={EMERGENCY_TYPES.map((t) => ({ value: t, label: t }))} />
              
              <Select
                label="Priority"
                required
                value={form.priority}
                error={errors.priority}
                onChange={(e) => set('priority', e.target.value)}
                options={PRIORITIES.map((p) => ({ value: p, label: p }))}
                hint="Critical means life is at immediate risk." />
              
            </div>
            <Textarea
              label="Description"
              required
              rows={5}
              value={form.description}
              error={errors.description}
              placeholder="What is happening, how many people are affected, and anything the team should know before arriving."
              onChange={(e) => set('description', e.target.value)} />
            
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Location"
            icon={CrosshairIcon}
            actions={
            <Button size="sm" icon={CrosshairIcon} loading={locating} onClick={detectLocation}>
                GET MY LOCATION
              </Button>
            } />
          
          <div className="space-y-4 p-4 sm:p-5">
            <Input
              label="Address"
              required
              value={form.address}
              error={errors.address}
              placeholder="Street, landmark, building name"
              onChange={(e) => set('address', e.target.value)} />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="City" required value={form.city} error={errors.city} onChange={(e) => set('city', e.target.value)} />
              <Input label="State" required value={form.state} error={errors.state} onChange={(e) => set('state', e.target.value)} />
              <Input
                label="Pincode"
                inputMode="numeric"
                value={form.pincode}
                error={errors.pincode}
                placeholder="360005"
                onChange={(e) => set('pincode', e.target.value)} />
              
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                value={form.latitude}
                placeholder="22.2823"
                onChange={(e) => set('latitude', e.target.value)} />
              
              <Input
                label="Longitude"
                value={form.longitude}
                placeholder="70.7688"
                onChange={(e) => set('longitude', e.target.value)} />
              
            </div>

            {form.address &&
            <MapPreview
              address={form.address}
              city={form.city}
              latitude={Number(form.latitude) || undefined}
              longitude={Number(form.longitude) || undefined}
              height={160} />

            }
          </div>
        </Card>

        <Card>
          <CardHeader title="Emergency contact" subtitle="Optional — someone we can reach if you are unreachable" />
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <Input
              label="Contact name"
              value={form.contactName}
              onChange={(e) => set('contactName', e.target.value)}
              placeholder="Meena Patel" />
            
            <Input
              label="Contact phone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => set('contactPhone', e.target.value)}
              placeholder="+91 98250 11224" />
            
          </div>
        </Card>

        <div className="sticky bottom-20 z-10 lg:bottom-4">
          <Button type="submit" variant="primary" size="xl" block icon={SirenIcon}>
            REPORT EMERGENCY
          </Button>
        </div>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Are you sure you want to report this emergency?"
        description="The control room will dispatch a response team based on the details you submit."
        icon={SirenIcon}
        size="sm"
        footer={
        <>
            <Button variant="secondary" data-close onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={confirmReport}>
              Confirm emergency
            </Button>
          </>
        }>
        
        <dl className="space-y-2 text-[13px]">
          {[
          ['Type', form.type],
          ['Priority', form.priority],
          ['Location', `${form.address}, ${form.city}`]].
          map(([label, value]) =>
          <div key={label} className="flex justify-between gap-3">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right font-semibold text-ink">{value}</dd>
            </div>
          )}
        </dl>
      </Modal>
    </div>);

}