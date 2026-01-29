import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  CreditCard,
  Users,
  Settings,
  User
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Array<'ADMIN' | 'TENANT'>;
};

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tenants', label: 'Tenants', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/leases', label: 'Leases', icon: FileText },
  { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function filterNavItems(role: 'ADMIN' | 'TENANT' | undefined) {
  return navItems.filter((item) => !item.roles || (role && item.roles.includes(role)));
}
