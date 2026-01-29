'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = useMemo(() => {
    if (!user) return '';
    const source = user.name || user.email;
    return source
      .split(' ')
      .map((segment) => segment[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const confirmAndLogout = async () => {
    const confirmed = typeof window === 'undefined' ? false : window.confirm('Are you sure you want to logout?');
    if (!confirmed) return false;
    await logout();
    return true;
  };

  const handleLogout = async () => {
    const didLogout = await confirmAndLogout();
    if (didLogout) {
      router.push('/login');
    }
  };

  const handleMobileLogout = async () => {
    setOpen(false);
    const didLogout = await confirmAndLogout();
    if (didLogout) {
      router.push('/login');
    }
  };

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);
  return (
    <header className="px-4 md:px-6 h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 min-w-0">
        <Image src="/logo.png" alt="Ultimate Apartment Manager" width={28} height={28} className="rounded" />
        <span className="font-semibold tracking-tight whitespace-nowrap truncate max-w-[180px] sm:max-w-none">Ultimate Apartment Manager</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/">Home</Link>
        {user ? (
          <>
            <Link className="hover:text-foreground" href="/dashboard">Dashboard</Link>
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-sm font-medium">{user.name || user.email}</span>
              <div className="h-8 w-8 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                {initials || 'U'}
              </div>
            </div>
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link className="hover:text-foreground" href="/login">Login</Link>
            <Link className="hover:text-foreground" href="/register">Sign up</Link>
          </>
        )}
      </nav>

      {/* Mobile menu button */}
      <button
        aria-label="Open menu"
        className="md:hidden p-2 rounded-md hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar */}
      {open ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 h-screen min-h-[100dvh] w-screen bg-background/40 backdrop-blur-md animate-in fade-in duration-200 z-[90]"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 h-screen min-h-[100dvh] w-72 max-w-[85vw] bg-background border-l shadow-xl p-6 animate-in slide-in-from-right duration-200 z-[100]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded" />
                <span className="font-semibold">UAM</span>
              </div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-4 text-foreground">
              <Link className="hover:text-secondary" href="/" onClick={() => setOpen(false)}>Home</Link>
              {user ? (
                <>
                  <Link className="hover:text-secondary" href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                  <button
                    className="flex items-center gap-2 text-left text-destructive hover:text-destructive/80"
                    onClick={handleMobileLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link className="hover:text-secondary" href="/login" onClick={() => setOpen(false)}>Login</Link>
                  <Link className="hover:text-secondary" href="/register" onClick={() => setOpen(false)}>Sign up</Link>
                </>
              )}
              <Link className="hover:text-secondary" href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
