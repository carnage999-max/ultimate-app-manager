import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";

export default async function SettingsPage() {
  const token = (await cookies()).get('token')?.value;
  const payload = token ? (verifyToken(token) as { userId: string } | null) : null;
  const user = payload
    ? await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { name: true, email: true, role: true },
      })
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account details and see what's coming soon.</p>
      </div>
      <Card className="p-6 space-y-2">
        <h3 className="text-lg font-semibold">Account</h3>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <div className="text-sm">
          <div className="font-medium">{user?.name || 'Unknown User'}</div>
          <div className="text-muted-foreground">{user?.email}</div>
          <div className="text-muted-foreground">Role: {user?.role}</div>
        </div>
      </Card>
      <Card className="p-6 space-y-3">
        <h3 className="text-lg font-semibold">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          Notification preferences, billing contacts, and third-party integrations will live here in a future release.
        </p>
      </Card>
    </div>
  );
}
