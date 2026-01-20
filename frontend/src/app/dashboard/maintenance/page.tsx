'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  tenant?: {
    name: string;
  }
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/maintenance');
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/maintenance', newTicket);
      setShowCreateForm(false);
      fetchTickets();
      setNewTicket({ title: '', description: '', priority: 'MEDIUM' });
    } catch (error) {
      alert('Failed to create ticket.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">Track and manage maintenance requests.</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Service
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 border-secondary/20 bg-secondary/5">
          <h3 className="text-lg font-semibold mb-4">New Service Request</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Issue Title</label>
              <Input 
                 placeholder="e.g. Leaking Faucet" 
                 value={newTicket.title}
                 onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea 
                 className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 placeholder="Describe the issue details..."
                 value={newTicket.description}
                 onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                 required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select 
                 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 value={newTicket.priority}
                 onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
              >
                <option value="LOW">Low - It can wait</option>
                <option value="MEDIUM">Medium - Normal usage affected</option>
                <option value="HIGH">High - Urgent repair needed</option>
                <option value="URGENT">Urgent - Emergency</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">Loading tickets...</div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-6 flex flex-col md:flex-row gap-6 hover:border-secondary/50 transition-colors">
               <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                     <span className={cn("px-2 py-0.5 rounded textxs font-bold uppercase", getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                     </span>
                     <h4 className="font-semibold text-lg">{ticket.title}</h4>
                  </div>
                  <p className="text-muted-foreground">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                     <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                     </span>
                     {ticket.tenant && (
                       <span>Requested by: {ticket.tenant.name}</span>
                     )}
                  </div>
               </div>
               
               <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ticket.status.replace('_', ' ')}</span>
                    {ticket.status === 'RESOLVED' ? (
                       <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                       <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  {/* Admin actions could go here */}
               </div>
            </Card>
          ))}
          
          {tickets.length === 0 && (
             <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                <Wrench className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold">No Maintenance Requests</h3>
                <p className="text-muted-foreground">Everything looks good!</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
