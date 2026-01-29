import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/get-current-user';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { redirect } from 'next/navigation';

function formatDate(date: Date) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Manage your information and device access.</p>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <ProfileForm initialName={user.name} email={user.email} />

        <aside className="space-y-4">
          <div className="soft-card p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account email</p>
              <p className="text-lg font-semibold break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-lg font-semibold">{user.role === 'ADMIN' ? 'Administrator' : 'Tenant'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="text-lg font-semibold">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="soft-card p-6 space-y-2 border border-muted">
            <h2 className="text-base font-semibold">Security tips</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Use a unique password for this account.</li>
              <li>Log out of shared devices when finished.</li>
              <li>Contact support if you suspect any unusual activity.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
