import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  DollarSign, 
  Activity, 
  ClipboardList,
  ShieldCheck,
  User
} from 'lucide-react';

async function getData() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  
  const payload = verifyToken(token) as { userId: string; role: string } | null;
  if (!payload) return null;

  // Mock data fetching logic based on role
  // In a real app, we would fetch stats from Prisma
  return {
    role: payload.role,
    userId: payload.userId,
    userName: 'User', // Would fetch
  };
}

export default async function DashboardPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
         <p className="text-muted-foreground">Welcome back to your dashboard.</p>
      </div>

      {/* Role specific content */}
      {data?.role === 'ADMIN' ? (
        <div className="rounded-xl border border-secondary/50 bg-secondary/10 p-6">
           <h3 className="flex items-center gap-2 text-lg font-bold text-secondary-foreground">
             <ShieldCheck className="h-5 w-5" />
             Admin Actions
           </h3>
           <p className="mt-2 text-sm text-foreground/80">
             You have full access to manage tenants, leases, and system settings.
           </p>
           <div className="mt-4 flex gap-4">
              <Button size="sm">Manage Users</Button>
              <Button size="sm" variant="outline">System Logs</Button>
           </div>
        </div>
      ) : (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
           <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600">
             <User className="h-5 w-5" />
             Tenant Actions
           </h3>
           <p className="mt-2 text-sm text-foreground/80">
             View your lease details, pay rent, and submit maintenance tickets.
           </p>
           <div className="mt-4 flex gap-4">
              <Button size="sm">Pay Rent</Button>
              <Button size="sm" variant="outline">Request Maintenance</Button>
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Revenue" 
          value="$45,231.89" 
          description="+20.1% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatsCard 
          title="Active Leases" 
          value="+2350" 
          description="+180.1% from last month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatsCard 
          title="Open Tickets" 
          value="12" 
          description="-10% from last month"
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatsCard 
          title="Active Now" 
          value="+573" 
          description="+201 since last hour"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-2">Latest actions on the platform.</p>
            <div className="mt-4 h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm">Chart Placeholder</p>
            </div>
         </div>
         <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold leading-none tracking-tight">Recent Tickets</h3>
            <p className="text-sm text-muted-foreground mt-2">Latest maintenance requests.</p>
             <div className="mt-4 space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                     <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center">
                       <WrenchIcon className="h-4 w-4 text-secondary-foreground" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Leaking Faucet</p>
                        <p className="text-xs text-muted-foreground">Apt 4B • 2 hours ago</p>
                     </div>
                     <div className="ml-auto text-xs font-semibold text-orange-500">OPEN</div>
                  </div>
                ))}
             </div>
         </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, description, icon }: any) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
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
