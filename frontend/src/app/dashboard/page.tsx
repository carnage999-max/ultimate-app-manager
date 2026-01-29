import type { ReactNode, ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/get-current-user';
import type { CurrentUser } from '@/lib/get-current-user';
import {
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  User,
  Wrench,
  CreditCard,
} from 'lucide-react';

type AdminStats = {
  tenantsCount: number;
  activeLeasesCount: number;
  openTicketsCount: number;
  resolvedTicketsCount: number;
  recentTickets: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    tenantName: string | null;
  }>;
};

type TenantStats = {
  monthlyRent: number | null;
  leaseEnd: string | null;
  leaseName: string | null;
  leaseStatus: string | null;
  tickets: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
};

type DashboardData = {
  user: CurrentUser;
  adminStats?: AdminStats;
  tenantStats?: TenantStats;
};

async function getData(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    if (user.role === 'ADMIN') {
      const [tenantsCount, activeLeasesCount, openTicketsCount, resolvedTicketsCount, recentTicketsRaw] = await Promise.all([
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
        user,
        adminStats: {
          tenantsCount,
          activeLeasesCount,
          openTicketsCount,
          resolvedTicketsCount,
          recentTickets: recentTicketsRaw.map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            createdAt: ticket.createdAt.toISOString(),
            tenantName: ticket.tenant?.name ?? null,
          })),
        },
      };
    }

    const [lease, tickets] = await Promise.all([
      prisma.lease.findFirst({
        where: { tenantId: user.id },
        orderBy: { startDate: 'desc' },
      }),
      prisma.maintenanceTicket.findMany({
        where: { tenantId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      user,
      tenantStats: {
        monthlyRent: lease ? Number(lease.rentAmount) : null,
        leaseEnd: lease ? lease.endDate.toISOString() : null,
        leaseName: lease?.name ?? null,
        leaseStatus: lease?.status ?? null,
        tickets: tickets.map((ticket) => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          createdAt: ticket.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error('Dashboard data error', error);
    return {
      user,
      adminStats:
        user.role === 'ADMIN'
          ? {
              tenantsCount: 0,
              activeLeasesCount: 0,
              openTicketsCount: 0,
              resolvedTicketsCount: 0,
              recentTickets: [],
            }
          : undefined,
      tenantStats:
        user.role === 'TENANT'
          ? {
              monthlyRent: null,
              leaseEnd: null,
              leaseName: null,
              leaseStatus: null,
              tickets: [],
            }
          : undefined,
    };
  }
}

export default async function DashboardPage() {
  const data = await getData();

  if (!data?.user) {
    return (
      <div className="soft-card p-6">
        <p className="text-sm text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    );
  }

  const isAdmin = data.user.role === 'ADMIN';
  const firstName = data.user.name?.split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h2 className="text-3xl font-bold tracking-tight">
          {firstName ? `Hello, ${firstName}` : 'Dashboard Overview'}
        </h2>
      </div>

      {isAdmin ? (
        <AdminOverview stats={data.adminStats} />
      ) : (
        <TenantOverview stats={data.tenantStats} />
      )}
    </div>
  );
}

function StatsCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: ReactNode }) {
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

function WrenchIcon(props: SVGProps<SVGSVGElement>) {
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
  );
}

function AdminOverview({ stats }: { stats?: AdminStats }) {
  return (
    <>
      <div className="soft-card border-secondary/50 bg-secondary/10 p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-secondary-foreground">
          <ShieldCheck className="h-5 w-5" />
          Admin Actions
        </h3>
        <p className="mt-2 text-sm text-foreground/80">You have full access to manage tenants, leases, and system settings.</p>
        <div className="mt-4 flex gap-4 flex-wrap">
          <Button size="sm" asChild>
            <Link href="/dashboard/tenants">Manage Tenants</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/maintenance">Review Tickets</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tenants"
          value={String(stats?.tenantsCount ?? 0)}
          description="Total registered tenants"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Active Leases"
          value={String(stats?.activeLeasesCount ?? 0)}
          description="Currently active leases"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Open Tickets"
          value={String(stats?.openTicketsCount ?? 0)}
          description="Open or in-progress"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Resolved Tickets"
          value={String(stats?.resolvedTicketsCount ?? 0)}
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
            {(stats?.recentTickets ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets yet.</p>
            ) : (
              (stats?.recentTickets ?? []).map((ticket) => (
                <div key={ticket.id} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center">
                    <WrenchIcon className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(ticket.tenantName || 'Tenant')} - {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`ml-auto text-xs font-semibold ${ticket.status === 'RESOLVED' ? 'text-green-600' : 'text-orange-500'}`}>
                    {ticket.status.replace('_', ' ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TenantOverview({ stats }: { stats?: TenantStats }) {
  const quickActions = [
    {
      label: 'Pay Rent',
      description: 'Secure card or ACH payments',
      href: '/dashboard/payments',
      icon: CreditCard,
    },
    {
      label: 'My Lease',
      description: 'Review documents & renewals',
      href: '/dashboard/leases',
      icon: FileText,
    },
    {
      label: 'Request Maintenance',
      description: 'Report an issue in your unit',
      href: '/dashboard/maintenance',
      icon: Wrench,
    },
    {
      label: 'My Profile',
      description: 'Update contact preferences',
      href: '/dashboard/profile',
      icon: User,
    },
  ];

  const rentDisplay =
    typeof stats?.monthlyRent === 'number'
      ? `$${stats.monthlyRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '--';
  const leaseEndDisplay = stats?.leaseEnd
    ? new Date(stats.leaseEnd).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '--';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="soft-card border border-emerald-100 bg-emerald-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Monthly Rent</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{rentDisplay}</p>
          <p className="mt-1 text-sm text-emerald-700">
            {stats?.leaseName ? `Lease: ${stats.leaseName}` : 'Linked to your current lease'}
          </p>
        </div>
        <div className="soft-card border border-amber-100 bg-amber-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Lease Ends</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{leaseEndDisplay}</p>
          <p className="mt-1 text-sm text-amber-700">
            {stats?.leaseStatus ? stats.leaseStatus.replace('_', ' ') : 'No lease status available'}
          </p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Jump straight into the tools you use most</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <QuickActionCard key={action.label} {...action} />
          ))}
        </div>
      </section>

      <section className="soft-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold leading-tight">Recent Tickets</h3>
            <p className="text-sm text-muted-foreground">Track the latest maintenance updates.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/maintenance">View all</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {(stats?.tickets ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven&apos;t submitted any tickets yet.</p>
          ) : (
            (stats?.tickets ?? []).map((ticket) => <TenantTicket key={ticket.id} ticket={ticket} />)
          )}
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({
  label,
  description,
  href,
  icon: Icon,
}: {
  label: string;
  description: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <Link
      href={href}
      className="soft-card border border-muted bg-card/80 p-5 hover:border-foreground/20 transition flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function TenantTicket({ ticket }: { ticket: TenantStats['tickets'][number] }) {
  const resolved = ticket.status === 'RESOLVED';
  return (
    <div className="flex items-center gap-4 rounded-lg border border-muted bg-card/70 p-4">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${resolved ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        <Wrench className={resolved ? 'h-5 w-5 text-emerald-600' : 'h-5 w-5 text-amber-600'} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{ticket.title}</p>
        <p className="text-xs text-muted-foreground">
          {ticket.status.replace('_', ' ')} - {new Date(ticket.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span className={`text-xs font-semibold ${resolved ? 'text-emerald-600' : 'text-amber-600'}`}>
        {resolved ? 'Resolved' : 'In progress'}
      </span>
    </div>
  );
}
