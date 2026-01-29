'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle, Loader2, UploadCloud } from 'lucide-react';
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attendingId, setAttendingId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      attachments.forEach((att) => URL.revokeObjectURL(att.preview));
    };
  }, [attachments]);

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
      const attachmentUrls = await uploadAttachments();
      await axios.post('/api/maintenance', { ...newTicket, attachments: attachmentUrls });
      setShowCreateForm(false);
      fetchTickets();
      setNewTicket({ title: '', description: '', priority: 'MEDIUM' });
      clearAttachments();
    } catch (error) {
      alert('Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearAttachments = () => {
    setAttachments((prev) => {
      prev.forEach((att) => URL.revokeObjectURL(att.preview));
      return [];
    });
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      event.target.value = '';
      return;
    }
    setAttachments((prev) => {
      if (prev.length >= 5) {
        alert('You can upload a maximum of 5 images.');
        return prev;
      }
      const preview = URL.createObjectURL(file);
      const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `att-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      return [...prev, { id, file, preview }];
    });
    event.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((att) => att.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((att) => att.id !== id);
    });
  };

  const uploadAttachments = async () => {
    const urls: string[] = [];
    for (const attachment of attachments) {
      const { data } = await axios.post('/api/files/upload-url', {
        filename: attachment.file.name,
        contentType: attachment.file.type,
      }, { withCredentials: true });

      await axios.put(data.uploadUrl, attachment.file, {
        headers: { 'Content-Type': attachment.file.type },
      });

      const directUrl = data.fileUrl || (typeof data.uploadUrl === 'string' ? data.uploadUrl.split('?')[0] : '');
      if (directUrl) {
        urls.push(directUrl);
      }
    }
    return urls;
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
              setNewTicket({ title: '', description: '', priority: 'MEDIUM' });
              clearAttachments();
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
                  {attachments.length}/5 selected
                </span>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="relative group">
                      <img
                        src={att.preview}
                        alt="Ticket attachment"
                        className="h-20 w-20 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 text-xs opacity-0 group-hover:opacity-100 transition"
                        onClick={() => removeAttachment(att.id)}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {attachments.length < 5 && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    Select up to 5 images (.jpg, .png). Files upload automatically when you submit the request.
                  </div>
                  <label className="rounded-lg border bg-background/50 p-3 flex items-center gap-2 cursor-pointer hover:border-secondary transition">
                    <UploadCloud className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Choose Photo</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelected}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTicket({ title: '', description: '', priority: 'MEDIUM' });
                  clearAttachments();
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

