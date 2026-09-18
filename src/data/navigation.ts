import {
  ActivityIcon,
  BarChart3Icon,
  BellIcon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  SettingsIcon,
  SirenIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon } from
'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Shown in mobile bottom navigation. */
  primary?: boolean;
}

export const userNav: NavItem[] = [
{ label: 'Dashboard', to: '/user/dashboard', icon: LayoutDashboardIcon, primary: true },
{ label: 'Report Emergency', to: '/user/report-emergency', icon: SirenIcon, primary: true },
{ label: 'My Emergencies', to: '/user/incidents', icon: ClipboardListIcon, primary: true },
{ label: 'Notifications', to: '/user/notifications', icon: BellIcon, primary: true },
{ label: 'Emergency Contacts', to: '/user/emergency-contacts', icon: PhoneIcon },
{ label: 'Profile', to: '/user/profile', icon: UserIcon },
{ label: 'Settings', to: '/user/settings', icon: SettingsIcon }];


export const adminNav: NavItem[] = [
{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboardIcon, primary: true },
{ label: 'Incidents', to: '/admin/incidents', icon: SirenIcon, primary: true },
{ label: 'Users', to: '/admin/users', icon: UsersIcon },
{ label: 'Teams', to: '/admin/teams', icon: ActivityIcon, primary: true },
{ label: 'Vehicles', to: '/admin/vehicles', icon: TruckIcon },
{ label: 'Resources', to: '/admin/resources', icon: PackageIcon },
{ label: 'Locations', to: '/admin/locations', icon: MapPinIcon },
{ label: 'Responses', to: '/admin/responses', icon: ClipboardListIcon },
{ label: 'Notifications', to: '/admin/notifications', icon: BellIcon },
{ label: 'Analytics', to: '/admin/analytics', icon: BarChart3Icon, primary: true },
{ label: 'Reports', to: '/admin/reports', icon: FileTextIcon }];


export const adminFooterNav: NavItem[] = [
{ label: 'Settings', to: '/admin/settings', icon: SettingsIcon }];


export const pageTitles: Record<string, string> = {
  '/user/dashboard': 'Dashboard',
  '/user/report-emergency': 'Report Emergency',
  '/user/incidents': 'My Emergencies',
  '/user/notifications': 'Notifications',
  '/user/emergency-contacts': 'Emergency Contacts',
  '/user/profile': 'Profile',
  '/user/settings': 'Settings',
  '/admin/dashboard': 'Emergency Response Dashboard',
  '/admin/incidents': 'Incident Management',
  '/admin/users': 'User Management',
  '/admin/teams': 'Team Management',
  '/admin/vehicles': 'Vehicle Management',
  '/admin/resources': 'Resource Management',
  '/admin/locations': 'Location Management',
  '/admin/responses': 'Response Records',
  '/admin/notifications': 'Notification Centre',
  '/admin/analytics': 'Emergency Analytics',
  '/admin/reports': 'Reports',
  '/admin/settings': 'System Settings'
};