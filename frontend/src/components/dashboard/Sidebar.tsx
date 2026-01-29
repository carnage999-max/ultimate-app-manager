'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { filterNavItems } from './nav-config';
import { useAuth } from '@/components/providers/AuthProvider';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const items = useMemo(() => filterNavItems(user?.role as 'ADMIN' | 'TENANT' | undefined), [user]);

  if (!user) {
    return null;
  }

  const initials = (user.name || user.email)
    .split(' ')
    .map((segment) => segment[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    const confirmed = typeof window === 'undefined' ? false : window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    await logout();
    router.push('/login');
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-card text-card-foreground md:flex h-screen sticky top-0">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
          <span>Ultimate Apartment manager</span>
        </Link>
      </div>
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">{user.name || user.email}</span>
          <span className="text-xs text-muted-foreground">{user.role === 'ADMIN' ? 'Administrator' : 'Tenant'}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-secondary/10 text-secondary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="destructive"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
