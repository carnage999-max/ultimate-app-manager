import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const auth = verifyToken(token) as { userId: string; role: string } | null;
    if (!auth) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { id } = await ctx.params;
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: { tenant: { select: { id: true, name: true, email: true } } },
    });
    if (!lease) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    // Permission: admin can view any; tenant only their own
    if (auth.role !== 'ADMIN' && lease.tenantId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(lease);
  } catch (error) {
    console.error('Lease GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const auth = verifyToken(token) as { userId: string; role: string } | null;
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await ctx.params;
    const body = await request.json();
  const data: any = {};
  if (body.startDate) data.startDate = new Date(body.startDate);
  if (body.endDate) data.endDate = new Date(body.endDate);
  if (body.rentAmount !== undefined) data.rentAmount = parseFloat(body.rentAmount);
  if (typeof body.status === 'string') data.status = body.status;
  if (typeof body.documentUrl === 'string') data.documentUrl = body.documentUrl;
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.tenantEmail === 'string' && body.tenantEmail.trim()) {
    const newTenant = await prisma.user.findUnique({ where: { email: body.tenantEmail.trim() } });
    if (!newTenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    data.tenantId = newTenant.id;
  }

    const lease = await prisma.lease.update({ where: { id }, data });
    return NextResponse.json(lease);
  } catch (error) {
    console.error('Lease PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const auth = verifyToken(token) as { userId: string; role: string } | null;
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await ctx.params;
    await prisma.lease.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Lease DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
