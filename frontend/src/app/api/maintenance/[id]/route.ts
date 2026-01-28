import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

const tenantSelect = {
  name: true,
  email: true,
  lease: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      rentAmount: true,
    },
  },
};

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as { userId: string; role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { id } = await ctx.params;
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        tenant: { select: tenantSelect },
      },
    });
    if (!ticket) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (payload.role !== 'ADMIN' && ticket.tenantId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as { userId: string; role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { id } = await ctx.params;
    const existing = await prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const isOwner = existing.tenantId === payload.userId;
    const isAdmin = payload.role === 'ADMIN';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();

    const data: any = {};
    let notifyAttended = false;
    if (isOwner) {
      if (typeof body.title === 'string') data.title = body.title;
      if (typeof body.description === 'string') data.description = body.description;
      if (typeof body.priority === 'string') data.priority = body.priority;
      if (typeof body.status === 'string') data.status = body.status;
      if (Array.isArray(body.attachments)) {
        data.attachments = body.attachments
          .filter((url: unknown) => typeof url === 'string' && url.trim().length > 0)
          .slice(0, 5);
      }
    }

    if (isAdmin && !isOwner) {
      if (body.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
        data.status = 'RESOLVED';
        notifyAttended = true;
      } else {
        return NextResponse.json({ error: 'Admins can only mark requests as attended.' }, { status: 400 });
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id },
      data,
      include: {
        tenant: { select: tenantSelect },
      },
    });

    if (notifyAttended && updated.tenant) {
      try {
        const { sendMaintenanceAttendedEmail } = await import('@/lib/email-templates');
        await sendMaintenanceAttendedEmail({
          tenantName: updated.tenant.name || 'Tenant',
          tenantEmail: updated.tenant.email,
          ticketTitle: updated.title,
        });
      } catch (emailError) {
        console.error('Maintenance attended email failed:', emailError);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Ticket PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as { userId: string; role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { id } = await ctx.params;
    const existing = await prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const isOwner = existing.tenantId === payload.userId;
    if (!isOwner) return NextResponse.json({ error: 'Only the tenant can delete this request.' }, { status: 403 });

    await prisma.maintenanceTicket.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Ticket DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
