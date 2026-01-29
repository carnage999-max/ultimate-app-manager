'use client';

import { useMemo, useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { filterNavItems } from './nav-config';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => filterNavItems(user?.role as 'ADMIN' | 'TENANT' | undefined), [user]);
  const initials = useMemo(() => {
    if (!user) return 'U';
    const source = user.name || user.email;
    return source
      .split(' ')
      .map((segment) => segment[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    const confirmed = typeof window === 'undefined' ? false : window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    await logout();
    router.push('/login');
  };

  const roleDescription = user.role === 'ADMIN' ? 'Admin control center' : 'Manage your lease and payments';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground">{roleDescription}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        {user.role === 'ADMIN' ? (
          <>
            <Button size="sm" asChild>
              <Link href="/dashboard/tenants">Manage tenants</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/leases">Review leases</Link>
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" asChild>
              <Link href="/dashboard/payments">Pay rent</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/maintenance">Request maintenance</Link>
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-medium leading-tight">{user.name || user.email}</span>
          <span className="text-xs text-muted-foreground">{user.role === 'ADMIN' ? 'Administrator' : 'Tenant'}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
          {initials}
        </div>
      </div>

      {open ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 h-screen min-h-[100dvh] w-screen bg-background/40 backdrop-blur-md animate-in fade-in duration-200 z-40"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 h-screen min-h-[100dvh] w-72 max-w-[85vw] bg-background border-l shadow-xl p-6 animate-in slide-in-from-right duration-200 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role === 'ADMIN' ? 'Administrator' : 'Tenant'}</p>
              </div>
              <button
                aria-label="Close"
                className="p-2 rounded-md hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 border-t pt-4">
              <button
                className="flex items-center gap-3 text-sm font-medium text-destructive hover:text-destructive/80"
                onClick={() => {
                  setOpen(false);
                  void handleLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
