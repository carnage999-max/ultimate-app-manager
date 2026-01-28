'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Search, FileText, Calendar, DollarSign, User as UserIcon, Loader2, Trash2, Edit, UploadCloud } from 'lucide-react';
import { StatusChip } from '@/components/ui/StatusChip';

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  name?: string | null;
  tenant: {
    name: string;
    email: string;
  }
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lease | null>(null);
  
  // Form State
  const [newLease, setNewLease] = useState({
    tenantEmail: '',
    rentAmount: '',
    startDate: '',
    endDate: '',
    documentUrl: '',
    name: '',
  });

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      const res = await axios.get('/api/leases');
      setLeases(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // prevent double submit
    setSubmitting(true);
    try {
      await axios.post('/api/leases', newLease);
      setShowCreateForm(false);
      fetchLeases();
      // Reset form
      setNewLease({ tenantEmail: '', rentAmount: '', startDate: '', endDate: '', documentUrl: '', name: '' });
    } catch (error) {
      alert('Failed to create lease. Check if tenant email exists.');
    } finally {
      setSubmitting(false);
    }
  };

  const [editForm, setEditForm] = useState({
    tenantEmail: '',
    rentAmount: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    documentUrl: '',
    name: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const startEdit = (lease: Lease) => {
    setEditingLease(lease);
    setEditForm({
      tenantEmail: lease.tenant.email,
      rentAmount: String(lease.rentAmount),
      startDate: lease.startDate.slice(0, 10),
      endDate: lease.endDate.slice(0, 10),
      status: lease.status,
      documentUrl: '',
      name: lease.name || '',
    });
  };

  const handleEditLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLease) return;
    setEditSubmitting(true);
    try {
          await axios.patch(`/api/leases/${editingLease.id}`, editForm);
      setEditingLease(null);
      fetchLeases();
    } catch (error) {
      alert('Failed to update lease.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteLease = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/leases/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchLeases();
    } catch (error) {
      alert('Failed to delete lease.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
            <span>Lease Management</span>
            <span className="text-muted-foreground text-lg">({leases.length})</span>
            {/* Per-status chips */}
            {(() => {
              const counts: Record<string, number> = leases.reduce((acc, l) => {
                const key = (l.status || 'UNKNOWN').toUpperCase();
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const order = ['ACTIVE'];
              const entries = Object.entries(counts).sort((a, b) => {
                const ia = order.indexOf(a[0]);
                const ib = order.indexOf(b[0]);
                if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
                return a[0].localeCompare(b[0]);
              });
              return entries.map(([status, count]) => (
                <StatusChip key={status} status={status} count={count} />
              ));
            })()}
          </h2>
          <p className="text-muted-foreground">View and manage property leases.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Lease
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 border-secondary/20 bg-secondary/5">
          <h3 className="text-lg font-semibold mb-4">Create New Lease</h3>
          <form onSubmit={handleCreateLease} className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Lease Name (optional)</label>
              <Input
                placeholder="Lease for Apt 2A"
                value={newLease.name}
                onChange={(e) => setNewLease({ ...newLease, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tenant Email</label>
              <Input 
                 placeholder="tenant@example.com" 
                 value={newLease.tenantEmail}
                 onChange={(e) => setNewLease({...newLease, tenantEmail: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rent Amount ($)</label>
              <Input 
                 type="number"
                 placeholder="1200" 
                 value={newLease.rentAmount}
                 onChange={(e) => setNewLease({...newLease, rentAmount: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input 
                 type="date"
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                 value={newLease.startDate}
                 onChange={(e) => setNewLease({...newLease, startDate: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input 
                 type="date" 
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                 value={newLease.endDate}
                 onChange={(e) => setNewLease({...newLease, endDate: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lease Document (optional)</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://..."
                  value={newLease.documentUrl}
                  onChange={(e) => setNewLease({ ...newLease, documentUrl: e.target.value })}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => alert('Use mobile or admin tools to upload to S3 for now.') }>
                  <UploadCloud className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : 'Create Lease'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">Loading leases...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {leases.map((lease) => (
        <Card key={lease.id} className="p-6 hover:-translate-y-0.5 transition-transform">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{lease.tenant.name || 'Unknown Tenant'}</h4>
                      <p className="text-xs text-muted-foreground">{lease.tenant.email}</p>
                    </div>
                  </div>
                  <StatusChip status={lease.status || 'UNKNOWN'} />
               </div>
               
               <div className="space-y-3 text-sm">
                 <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <DollarSign className="h-4 w-4" />
                       Rent
                    </div>
                    <span className="font-bold">${lease.rentAmount}</span>
                 </div>
                 <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Calendar className="h-4 w-4" />
                       Peroid
                    </div>
                    <span className="font-medium">
                      {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                    </span>
                 </div>
               </div>

           <div className="mt-4 pt-4 border-t flex gap-2">
                 <Button variant="outline" size="sm" className="w-full" onClick={() => startEdit(lease)}>
                   <Edit className="h-4 w-4 mr-2" /> Edit
                 </Button>
                 <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => setDeleteTarget(lease)}>
                   <Trash2 className="h-4 w-4 mr-2" /> Delete
                 </Button>
           </div>
        </Card>
      ))}
          
          {leases.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl">
               <p className="text-muted-foreground">No leases found.</p>
            </div>
          )}
        </div>
      )}

      {editingLease ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Lease</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingLease(null)}>Close</Button>
            </div>
            <form onSubmit={handleEditLease} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Tenant Email</label>
                <Input value={editForm.tenantEmail} onChange={(e) => setEditForm({ ...editForm, tenantEmail: e.target.value })} required />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Rent Amount ($)</label>
                  <Input type="number" value={editForm.rentAmount} onChange={(e) => setEditForm({ ...editForm, rentAmount: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ENDED">ENDED</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Document URL</label>
                <Input placeholder="https://..." value={editForm.documentUrl} onChange={(e) => setEditForm({ ...editForm, documentUrl: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Lease Name</label>
                <Input placeholder="Lease name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingLease(null)}>Cancel</Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>) : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Delete Lease</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the lease for {deleteTarget.tenant.name || deleteTarget.tenant.email}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteLease}>Delete</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

