import { AppModule, RoleKey } from '@petals/types';
import type { PermissionsMap } from './store';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarClock,
  Wallet,
  MessageSquare,
  Filter,
  Clock,
  UserCog,
  FileText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  module?: AppModule;
}

export const ALL_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    module: AppModule.DASHBOARD,
  },
  {
    label: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    module: AppModule.APPOINTMENTS,
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Users,
    module: AppModule.CLIENTS,
  },
  {
    label: 'Schedule planning',
    href: '/schedule-planning',
    icon: CalendarClock,
    module: AppModule.SCHEDULE_PLANNING,
  },
  {
    label: 'Financial',
    href: '/financial',
    icon: Wallet,
    module: AppModule.FINANCIAL,
  },
  {
    label: 'Communication',
    href: '/communication',
    icon: MessageSquare,
    module: AppModule.COMMUNICATION,
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: Filter,
    module: AppModule.LEADS,
  },
  {
    label: 'HRMS',
    href: '/hrms',
    icon: Clock,
    module: AppModule.HRMS,
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: UserCog,
    module: AppModule.EMPLOYEES,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    module: AppModule.REPORTS,
  },
  {
    label: 'Role access',
    href: '/role-access',
    icon: ShieldCheck,
    module: AppModule.ROLE_ACCESS,
  },
];

export function buildNav(
  permissions: PermissionsMap,
  roleKey: RoleKey | null,
): NavItem[] {
  // Director gets all items
  if (roleKey === RoleKey.DIRECTOR) {
    return ALL_NAV_ITEMS;
  }

  return ALL_NAV_ITEMS.filter((item) => {
    // Dashboard is always visible to authenticated users
    if (item.label === 'Dashboard') return true;
    if (!item.module) return true;
    return !!permissions[item.module]?.enabled;
  });
}
