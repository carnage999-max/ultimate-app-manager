'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrendingUp, CalendarClock, Users, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Lease = {
  id: string;
  rentAmount: number;
  status: string;
  startDate: string;
  endDate: string;
  tenant?: {
    name: string | null;
    email: string;
  };
};

export default function RentOverviewPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/leases?admin=1');
        setLeases(res.data || []);
      } catch (error) {
        console.error('Failed to load leases', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const activeLeases = leases.filter((lease) => lease.status === 'ACTIVE');
    const inactiveLeases = leases.filter((lease) => lease.status !== 'ACTIVE');
    const totalRent = activeLeases.reduce((sum, lease) => sum + (Number(lease.rentAmount) || 0), 0);
    const upcomingExpirations = leases
      .filter((lease) => {
        const end = new Date(lease.endDate);
        const diff = end.getTime() - now.getTime();
        return diff > 0 && diff < 1000 * 60 * 60 * 24 * 90;
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 8);
    const overdueLeases = leases.filter((lease) => new Date(lease.endDate) < now);
    const upcomingRent = leases.filter(
      (lease) => new Date(lease.endDate) >= now && new Date(lease.endDate) <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90)
    );
    const monthlyProjection = totalRent * 12;

    return {
      totalRent,
      activeCount: activeLeases.length,
      inactiveCount: inactiveLeases.length,
      upcomingExpirations,
      overdueLeases,
      upcomingRent,
      monthlyProjection,
    };
  }, [leases]);

  const filteredLeases = useMemo(() => {
    if (filter === 'upcoming') return stats.upcomingRent || [];
    if (filter === 'overdue') return stats.overdueLeases || [];
    return leases;
  }, [filter, leases, stats]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rent Overview</h1>
            <p className="text-muted-foreground">Monitor rent performance and upcoming expirations.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/leases')}>
            Manage Leases
          </Button>
          <Button onClick={() => router.push('/dashboard/tenants')}>
            Contact Tenants
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase">Total Monthly Rent <TrendingUp className="h-4 w-4" /></div>
          <div className="text-3xl font-bold">${stats.totalRent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Active leases only</p>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase">Active Leases <Users className="h-4 w-4" /></div>
          <div className="text-3xl font-bold">{stats.activeCount}</div>
          <p className="text-xs text-muted-foreground">{stats.inactiveCount} inactive</p>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase">Projected Annual Rent</div>
          <div className="text-3xl font-bold">${stats.monthlyProjection.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Based on current monthly rent</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lease Status</h3>
            <span className="text-xs text-muted-foreground">{leases.length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {['ACTIVE', 'INACTIVE', 'ENDED'].map((status) => {
              const value = leases.filter((lease) => (lease.status || 'ACTIVE').toUpperCase() === status).length;
              const percent = leases.length ? Math.round((value / leases.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{status}</span>
                    <span>{value} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-2 rounded-full bg-secondary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Upcoming Expirations</h3>
          </div>
          {loading ? (
            <p className="text-muted-foreground mt-4">Loading…</p>
          ) : stats.upcomingExpirations.length === 0 ? (
            <p className="text-muted-foreground mt-4">No expirations in the next 90 days.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.upcomingExpirations.map((lease) => (
                <div key={lease.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{lease.tenant?.name || lease.tenant?.email || 'Tenant'}</p>
                    <p className="text-xs text-muted-foreground">Lease ends {new Date(lease.endDate).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/leases#${lease.id}`)}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Rent by Tenant</h3>
          </div>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'overdue'] as const).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key)}
              >
                {key === 'all' ? 'All' : key === 'upcoming' ? 'Upcoming' : 'Overdue'}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2">Tenant</th>
                <th className="py-2">Rent Due</th>
                <th className="py-2">Status</th>
                <th className="py-2">End Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className="border-b">
                  <td className="py-2">{lease.tenant?.name || lease.tenant?.email || 'Tenant'}</td>
                  <td className="py-2">${lease.rentAmount?.toLocaleString()}</td>
                  <td className="py-2">{lease.status}</td>
                  <td className="py-2">{new Date(lease.endDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredLeases.length === 0 && !loading ? (
                <tr><td className="py-4 text-muted-foreground" colSpan={4}>No leases in this filter.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
