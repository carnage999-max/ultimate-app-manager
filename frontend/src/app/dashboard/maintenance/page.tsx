'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/ui/FileUploader';
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { StatusChip } from '@/components/ui/StatusChip';
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
    email: string;
    lease?: {
      id: string;
      name?: string | null;
      startDate: string;
      endDate: string;
      rentAmount: number;
    } | null;
  }
  attachments?: string[];
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    attachments: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attendingId, setAttendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setIsAdmin(res.data?.user?.role === 'ADMIN');
      } catch (error) {
        console.error('Failed to load user role', error);
      }
    })();
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
    if (submitting) return; // prevent double submit
    setSubmitting(true);
    try {
      await axios.post('/api/maintenance', newTicket);
      setShowCreateForm(false);
      fetchTickets();
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', attachments: [] });
      setUploaderKey((k) => k + 1);
    } catch (error) {
      alert('Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttachmentUploaded = (url: string) => {
    setNewTicket((prev) => {
      if (prev.attachments.length >= 5) return prev;
      return { ...prev, attachments: [...prev.attachments, url] };
    });
    setUploaderKey((k) => k + 1);
  };

  const removeAttachment = (url: string) => {
    setNewTicket((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att !== url),
    }));
  };

  const markTicketAttended = async (ticketId: string) => {
    setAttendingId(ticketId);
    try {
      await axios.patch(`/api/maintenance/${ticketId}`, { status: 'RESOLVED' });
      fetchTickets();
    } catch (error) {
      alert('Failed to mark ticket as attended.');
    } finally {
      setAttendingId(null);
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
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
            <span>Maintenance</span>
            <span className="text-muted-foreground text-lg">({tickets.length})</span>
            {/* Per-status chips */}
            {(() => {
              const counts: Record<string, number> = tickets.reduce((acc, t) => {
                const key = (t.status || 'OPEN').toUpperCase();
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const order = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
              const entries = Object.entries(counts).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
              return entries.map(([status, count]) => (
                <StatusChip key={status} status={status} count={count} />
              ));
            })()}
          </h2>
          <p className="text-muted-foreground">Track and manage maintenance requests.</p>
        </div>
        <Button
          onClick={() => {
            if (showCreateForm) {
              setShowCreateForm(false);
              setNewTicket({ title: '', description: '', priority: 'MEDIUM', attachments: [] });
              setUploaderKey((k) => k + 1);
            } else {
              setShowCreateForm(true);
            }
          }}
        >
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
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Photo Attachments</label>
                <span className="text-xs text-muted-foreground">
                  {newTicket.attachments.length}/5 uploaded
                </span>
              </div>
              {newTicket.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {newTicket.attachments.map((url) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt="Ticket attachment"
                        className="h-20 w-20 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 text-xs opacity-0 group-hover:opacity-100 transition"
                        onClick={() => removeAttachment(url)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {newTicket.attachments.length < 5 && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    Upload up to 5 images (.jpg, .png). Each upload replaces this control so you can add multiple files.
                  </div>
                  <div className="rounded-lg border bg-background/50 p-3">
                    <FileUploader key={uploaderKey} onUploadComplete={handleAttachmentUploaded} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTicket({ title: '', description: '', priority: 'MEDIUM', attachments: [] });
                  setUploaderKey((k) => k + 1);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>) : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">Loading tickets...</div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const isResolved = ticket.status === 'RESOLVED';
            return (
            <Card
              key={ticket.id}
              className={cn(
                "p-6 hover:-translate-y-0.5 transition-transform flex flex-col md:flex-row gap-6 hover:border-secondary/50 transition-colors",
                isResolved && !isAdmin && 'opacity-60 bg-muted/60 hover:-translate-y-0'
              )}
            >
               <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                     <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                     </span>
                     <h4 className="font-semibold text-lg">{ticket.title}</h4>
                  </div>
                  <p className="text-muted-foreground">{ticket.description}</p>
                 <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                     <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                     </span>
                     {ticket.tenant && (
                       <span className="flex flex-col sm:flex-row sm:items-center gap-1">
                         <span>Requested by: {ticket.tenant.name || 'Tenant'}</span>
                         <span className="text-muted-foreground/70">{ticket.tenant.email}</span>
                       </span>
                     )}
                     {ticket.tenant?.lease && (
                       <span className="flex flex-col gap-1">
                         <span className="font-medium text-muted-foreground/90">
                           Lease: {ticket.tenant.lease.name || 'Untitled'}
                         </span>
                         <span>
                           {new Date(ticket.tenant.lease.startDate).toLocaleDateString()} –{' '}
                           {new Date(ticket.tenant.lease.endDate).toLocaleDateString()}
                         </span>
                       </span>
                     )}
                 </div>
                 {ticket.attachments && ticket.attachments.length > 0 && (
                   <div className="mt-4">
                     <p className="text-sm font-medium mb-2">Attachments</p>
                     <div className="flex flex-wrap gap-3">
                       {ticket.attachments.map((url) => (
                         <a
                           key={url}
                           href={url}
                           target="_blank"
                           rel="noreferrer"
                           className="relative block"
                         >
                           <img
                             src={url}
                             alt="Attachment"
                             className="h-20 w-20 rounded-lg object-cover border hover:ring-2 hover:ring-primary transition"
                           />
                         </a>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
               
               <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2 min-w-[140px]">
                 <div className="flex items-center gap-2">
                    <StatusChip status={ticket.status} />
                 </div>
                 {isAdmin && ticket.status !== 'RESOLVED' && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => markTicketAttended(ticket.id)}
                     disabled={attendingId === ticket.id}
                   >
                     {attendingId === ticket.id ? (
                       <>
                         <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                         Updating...
                       </>
                     ) : (
                       'Mark Attended'
                     )}
                   </Button>
                 )}
               </div>
            </Card>
          )})}
          
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

