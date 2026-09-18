import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardListIcon, MapPinIcon, SearchIcon, SirenIcon, TruckIcon, UsersIcon, BoxIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { incidentService } from "../../services/incidentService";
import { locationService } from "../../services/locationService";
import { teamService } from "../../services/teamService";
import { userService } from "../../services/userService";
import { vehicleService } from "../../services/vehicleService";
import { cn } from "../../utils/cn";
interface Entry {
  id: string;
  group: 'Incidents' | 'Users' | 'Teams' | 'Vehicles' | 'Locations';
  title: string;
  subtitle: string;
  to: string;
  icon: BoxIcon;
  keywords: string;
}
export function CommandPalette({
  open,
  onClose



}: {open: boolean;onClose: () => void;}) {
  const {
    user
  } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cursor, setCursor] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setCursor(0);
    let cancelled = false;
    const load = async () => {
      const [incidents, users, teams, vehicles, locations] = await Promise.all([isAdmin ? incidentService.list() : incidentService.listByUser(user?.id ?? ''), isAdmin ? userService.list() : Promise.resolve([]), isAdmin ? teamService.list() : Promise.resolve([]), isAdmin ? vehicleService.list() : Promise.resolve([]), isAdmin ? locationService.list() : Promise.resolve([])]);
      if (cancelled) return;
      const base = isAdmin ? '/admin' : '/user';
      setEntries([...incidents.map<Entry>((i) => ({
        id: i.id,
        group: 'Incidents',
        title: `${i.code} · ${i.type}`,
        subtitle: `${i.priority} priority · ${i.status}`,
        to: `${base}/incidents/${i.id}`,
        icon: SirenIcon,
        keywords: `${i.code} ${i.type} ${i.status} ${i.priority}`
      })), ...users.map<Entry>((u) => ({
        id: u.id,
        group: 'Users',
        title: u.name,
        subtitle: `${u.phone} · ${u.city}`,
        to: '/admin/users',
        icon: UsersIcon,
        keywords: `${u.name} ${u.email} ${u.phone} ${u.city}`
      })), ...teams.map<Entry>((t) => ({
        id: t.id,
        group: 'Teams',
        title: t.name,
        subtitle: `${t.type} · ${t.availability}`,
        to: '/admin/teams',
        icon: ClipboardListIcon,
        keywords: `${t.name} ${t.type} ${t.contact}`
      })), ...vehicles.map<Entry>((v) => ({
        id: v.id,
        group: 'Vehicles',
        title: v.number,
        subtitle: `${v.type} · ${v.status}`,
        to: '/admin/vehicles',
        icon: TruckIcon,
        keywords: `${v.number} ${v.type} ${v.status}`
      })), ...locations.map<Entry>((l) => ({
        id: l.id,
        group: 'Locations',
        title: l.address,
        subtitle: `${l.city}, ${l.state} · ${l.pincode}`,
        to: '/admin/locations',
        icon: MapPinIcon,
        keywords: `${l.address} ${l.city} ${l.pincode}`
      }))]);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, isAdmin, user?.id]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? entries.filter((e) => e.keywords.toLowerCase().includes(q)) : entries.slice(0, 8);
    return filtered.slice(0, 12);
  }, [entries, query]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === 'Enter' && results[cursor]) {
        navigate(results[cursor].to);
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, cursor, navigate, onClose]);
  let lastGroup = '';
  return <AnimatePresence>
      {open && <div className="fixed inset-0 z-[75] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-ink/45" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.15,
        ease: 'easeOut'
      }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label="Global search" initial={{
        opacity: 0,
        y: -8,
        scale: 0.98
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: -6,
        scale: 0.98
      }} transition={{
        duration: 0.18,
        ease: [0.23, 1, 0.32, 1]
      }} className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
            <div className="flex items-center gap-2.5 border-b border-line px-4">
              <SearchIcon className="h-4 w-4 text-muted" aria-hidden />
              <input autoFocus value={query} onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }} placeholder="Search incident ID, user, phone, team, vehicle, location…" aria-label="Search" className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none" />
              <kbd className="rounded border border-line bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                ESC
              </kbd>
            </div>

            <div className="ers-scroll max-h-[52vh] overflow-y-auto py-1.5">
              {results.length === 0 ? <p className="px-4 py-8 text-center text-[13px] text-muted">
                  No records matched “{query}”.
                </p> : results.map((entry, index) => {
            const showGroup = entry.group !== lastGroup;
            lastGroup = entry.group;
            const Icon = entry.icon;
            return <React.Fragment key={`${entry.group}-${entry.id}`}>
                      {showGroup && <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          {entry.group}
                        </p>}
                      <button type="button" onMouseEnter={() => setCursor(index)} onClick={() => {
                navigate(entry.to);
                onClose();
              }} className={cn('flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150 ease-out', index === cursor ? 'bg-primary-light' : 'hover:bg-subtle')}>
                        <Icon className={cn('h-4 w-4 shrink-0', index === cursor ? 'text-primary' : 'text-muted')} aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink">
                            {entry.title}
                          </span>
                          <span className="block truncate text-[12px] text-muted">
                            {entry.subtitle}
                          </span>
                        </span>
                      </button>
                    </React.Fragment>;
          })}
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}