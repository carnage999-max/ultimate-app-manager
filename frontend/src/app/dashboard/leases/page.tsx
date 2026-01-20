'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Search, FileText, Calendar, DollarSign, User as UserIcon } from 'lucide-react';

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  tenant: {
    name: string;
    email: string;
  }
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form State
  const [newLease, setNewLease] = useState({
    tenantEmail: '',
    rentAmount: '',
    startDate: '',
    endDate: '',
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
    try {
      await axios.post('/api/leases', newLease);
      setShowCreateForm(false);
      fetchLeases();
      // Reset form
      setNewLease({ tenantEmail: '', rentAmount: '', startDate: '', endDate: '' });
    } catch (error) {
      alert('Failed to create lease. Check if tenant email exists.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lease Management</h2>
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
          <form onSubmit={handleCreateLease} className="grid gap-4 md:grid-cols-2">
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
              <Input 
                 type="date"
                 value={newLease.startDate}
                 onChange={(e) => setNewLease({...newLease, startDate: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input 
                 type="date" 
                 value={newLease.endDate}
                 onChange={(e) => setNewLease({...newLease, endDate: e.target.value})}
                 required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              <Button type="submit">Create Lease</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">Loading leases...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leases.map((lease) => (
            <Card key={lease.id} className="p-6 hover:shadow-md transition-shadow">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${lease.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {lease.status}
                  </span>
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
                 <Button variant="outline" size="sm" className="w-full">View Details</Button>
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
    </div>
  );
}
