'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

type ProfileFormProps = {
  initialName: string | null;
  email: string;
};

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const { user, setUser, refresh } = useAuth();
  const [name, setName] = useState(initialName ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setMessage(null);
    try {
      const response = await fetch('/api/auth/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to update profile');
      }
      const data = await response.json();
      setStatus('success');
      setMessage('Profile updated successfully.');
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        });
      } else {
        await refresh();
      }
    } catch (error) {
      console.error('Profile update failed', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setTimeout(() => {
        setStatus('idle');
      }, 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="soft-card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-tight">Personal Details</h2>
        <p className="text-sm text-muted-foreground">Keep your information up to date so property managers can reach you.</p>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={user?.email ?? email}
          disabled
          className="w-full rounded-md border border-dashed border-input/70 bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">Contact support to change your primary login email.</p>
      </div>
      {message ? (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            status === 'error' ? 'border-destructive/50 text-destructive' : 'border-emerald-500/60 text-emerald-700'
          }`}
        >
          {message}
        </div>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
