import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  Users, 
  Activity, 
  ClipboardList,
  ShieldCheck,
  FileText,
  AlertTriangle,
  User
} from 'lucide-react';

async function getData() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  const payload = verifyToken(token) as { userId: string; role: string } | null;
  if (!payload) return null;
  try {
    const [tenantsCount, activeLeasesCount, openTicketsCount, resolvedTicketsCount, recentTickets] = await Promise.all([
      prisma.user.count({ where: { role: 'TENANT' } }),
      prisma.lease.count({ where: { status: 'ACTIVE' } }),
      prisma.maintenanceTicket.count({ where: { OR: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }] } }),
      prisma.maintenanceTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.maintenanceTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { tenant: { select: { name: true } } },
      }),
    ]);

    return {
      role: payload.role,
      userId: payload.userId,
      tenantsCount,
      activeLeasesCount,
      openTicketsCount,
      resolvedTicketsCount,
      recentTickets,
    };
  } catch (e) {
    // Fallback to zeros if DB unavailable
    return {
      role: payload.role,
      userId: payload.userId,
      tenantsCount: 0,
      activeLeasesCount: 0,
      openTicketsCount: 0,
      resolvedTicketsCount: 0,
      recentTickets: [] as any[],
    };
  }
}

export default async function DashboardPage() {
  const data = await getData();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
         <p className="text-muted-foreground">Welcome back to your dashboard.</p>
      </div>

      {data?.role === 'ADMIN' ? (
        <div className="soft-card border-secondary/50 bg-secondary/10 p-6">
           <h3 className="flex items-center gap-2 text-lg font-bold text-secondary-foreground">
             <ShieldCheck className="h-5 w-5" />
             Admin Actions
           </h3>
           <p className="mt-2 text-sm text-foreground/80">
             You have full access to manage tenants, leases, and system settings.
           </p>
           <div className="mt-4 flex gap-4">
              <Link href="/dashboard/leases"><Button size="sm">Manage Users</Button></Link>
              <Link href="/dashboard/maintenance"><Button size="sm" variant="outline">System Logs</Button></Link>
           </div>
        </div>
      ) : (
        <div className="soft-card border-blue-500/20 bg-blue-500/5 p-6">
           <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600">
             <User className="h-5 w-5" />
             Tenant Actions
           </h3>
           <p className="mt-2 text-sm text-foreground/80">
             View your lease details, pay rent, and submit maintenance tickets.
           </p>
           <div className="mt-4 flex gap-4">
              <Link href="/dashboard/payments"><Button size="sm">Pay Rent</Button></Link>
              <Link href="/dashboard/maintenance"><Button size="sm" variant="outline">Request Maintenance</Button></Link>
           </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Tenants" 
          value={String(data?.tenantsCount ?? 0)} 
          description="Total registered tenants"
          icon={<Users className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatsCard 
          title="Active Leases" 
          value={String(data?.activeLeasesCount ?? 0)} 
          description="Currently active leases"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatsCard 
          title="Open Tickets" 
          value={String(data?.openTicketsCount ?? 0)} 
          description="Open or in-progress"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatsCard 
          title="Resolved Tickets" 
          value={String(data?.resolvedTicketsCount ?? 0)} 
          description="Closed as resolved"
          icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <div className="col-span-4 soft-card p-6">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-2">Latest actions on the platform.</p>
            <div className="mt-4 h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm">Chart Placeholder</p>
            </div>
         </div>
         <div className="col-span-3 soft-card p-6">
            <h3 className="font-semibold leading-none tracking-tight">Recent Tickets</h3>
            <p className="text-sm text-muted-foreground mt-2">Latest maintenance requests.</p>
            <div className="mt-4 space-y-4">
              {(data?.recentTickets ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets yet.</p>
              ) : (
                (data?.recentTickets ?? []).map((t: any) => (
                  <div key={t.id} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center">
                      <WrenchIcon className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(t.tenant?.name || 'Tenant')} • {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`ml-auto text-xs font-semibold ${t.status === 'RESOLVED' ? 'text-green-600' : 'text-orange-500'}`}>
                      {t.status.replace('_', ' ')}
                    </div>
                  </div>
                ))
              )}
            </div>
         </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, description, icon }: any) {
  return (
    <div className="soft-card p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function WrenchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

