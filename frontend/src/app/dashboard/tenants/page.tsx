"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FileUploader } from "@/components/ui/FileUploader";
import { Check, Mail, UserPlus } from "lucide-react";

type User = { id: string; email: string; name?: string | null; role: string; createdAt: string };

const api = axios.create({
  withCredentials: true,
});

export default function TenantsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  // Lease modal state
  const [leaseOpen, setLeaseOpen] = useState(false);
  const [leaseFor, setLeaseFor] = useState<User | null>(null);
  const [leaseForm, setLeaseForm] = useState({ startDate: "", endDate: "", rentAmount: "", documentUrl: "" });

  // Email modal state
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [template, setTemplate] = useState("none");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError("");
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load users. Please try again.');
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => users.filter(u => [u.email, u.name || "", u.role].some(v => (v||"").toLowerCase().includes(filter.toLowerCase()))), [users, filter]);

  const toggle = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedUsers = users.filter(u => selected[u.id]);

  const openLeaseFor = (u: User) => { setLeaseFor(u); setLeaseForm({ startDate: "", endDate: "", rentAmount: "", documentUrl: "" }); setLeaseOpen(true); };

  const applyTemplate = (t: string) => {
    setTemplate(t);
    if (t === 'rent') {
      setEmailSubject('Rent Due Reminder');
      const due = new Date(); due.setDate(due.getDate() + 7);
      setEmailBody(`Hello,\n\nThis is a friendly reminder that your rent is due by ${due.toLocaleDateString()}.\nIf you have already paid, please ignore this message.\n\nThank you,\nUltimate Apartment Manager`);
    } else {
      setEmailSubject('Message from Ultimate Apartment Manager');
      setEmailBody('Hello,\n\n');
    }
  };

  const sendEmails = async () => {
    try {
      const to = selectedUsers.length > 0 ? selectedUsers.map(u => u.email) : users.filter(u => u.role === 'TENANT').map(u => u.email);
      if (to.length === 0) { alert('No recipients'); return; }
      // Convert simple body to basic HTML
      const html = emailBody.replace(/\n/g, '<br/>');
      await api.post('/api/email/send', { to, subject: emailSubject, html });
      alert('Emails sent');
      setEmailOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to send emails');
    }
  };

  const createLease = async () => {
    if (!leaseFor) return;
    try {
      await api.post('/api/leases', {
        tenantEmail: leaseFor.email,
        startDate: leaseForm.startDate,
        endDate: leaseForm.endDate,
        rentAmount: leaseForm.rentAmount,
        documentUrl: leaseForm.documentUrl || undefined,
      });
      alert('Lease assigned');
      setLeaseOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to assign lease');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage users, assign leases, and send email reminders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEmailOpen(true)}>
            <Mail className="h-4 w-4 mr-2" /> Send Email
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center">
          <Input placeholder="Filter by name, email, role" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        {error ? (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchUsers(); }}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="p-2"><input type="checkbox" onChange={(e) => {
                  const checked = e.target.checked; const map: Record<string, boolean> = {};
                  filtered.forEach(u => map[u.id] = checked); setSelected(map);
                }} /></th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={6}>Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="p-4" colSpan={6}>No users found.</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      <input type="checkbox" checked={!!selected[u.id]} onChange={() => toggle(u.id)} />
                    </td>
                    <td className="p-2">{u.name || '—'}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">
                      <Button size="sm" onClick={() => openLeaseFor(u)}>
                        <UserPlus className="h-3 w-3 mr-1" /> Assign Lease
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Lease Modal (simple inline) */}
      {leaseOpen && leaseFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Assign Lease — {leaseFor.email}</h3>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={leaseForm.startDate} onChange={(e) => setLeaseForm({ ...leaseForm, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={leaseForm.endDate} onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Rent ($)</label>
                <Input type="number" value={leaseForm.rentAmount} onChange={(e) => setLeaseForm({ ...leaseForm, rentAmount: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Lease Document (optional)</label>
                <FileUploader onUploadComplete={(url) => setLeaseForm({ ...leaseForm, documentUrl: url })} />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setLeaseOpen(false)}>Cancel</Button>
              <Button onClick={createLease}>Assign</Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Email Modal */}
      {emailOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Send Email</h3>
            <div className="grid gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-sm font-medium">Template</label>
                <select className="flex h-9 rounded-md border px-3 text-sm" value={template} onChange={(e) => applyTemplate(e.target.value)}>
                  <option value="none">Custom</option>
                  <option value="rent">Rent Due Reminder</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea className="w-full min-h-[140px] rounded-md border px-3 py-2 text-sm" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Sending to {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : 'all tenants'}.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
              <Button onClick={sendEmails}><Mail className="h-4 w-4 mr-1" /> Send</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
