import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { userId: string, role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    let leases;

    if (payload.role === 'ADMIN') {
      // Admin sees all leases
      leases = await prisma.lease.findMany({
        include: { tenant: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Tenant sees only their own lease
      leases = await prisma.lease.findMany({
        where: { tenantId: payload.userId },
        include: { tenant: { select: { name: true, email: true } } },
      });
    }

    return NextResponse.json(leases);
  } catch (error) {
    console.error('Leases GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { userId: string, role: string } | null;
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate, rentAmount, tenantEmail, documentUrl } = body;

    // Find tenant by email
    const tenant = await prisma.user.findUnique({ where: { email: tenantEmail } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const lease = await prisma.lease.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount),
        tenantId: tenant.id,
        documentUrl: typeof documentUrl === 'string' ? documentUrl : undefined,
      }
    });

    return NextResponse.json(lease, { status: 201 });

  } catch (error) {
    console.error('Lease POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
