import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const ticket = await prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
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

    // Tenants can edit title, description, priority. Admins can also edit status.
    const data: any = {};
    if (typeof body.title === 'string') data.title = body.title;
    if (typeof body.description === 'string') data.description = body.description;
    if (typeof body.priority === 'string') data.priority = body.priority;
    if (isAdmin && typeof body.status === 'string') data.status = body.status;

    const updated = await prisma.maintenanceTicket.update({ where: { id }, data });
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
    const isAdmin = payload.role === 'ADMIN';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.maintenanceTicket.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Ticket DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
