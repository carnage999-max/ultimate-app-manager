import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { userId: string, role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    let tickets;

    const tenantInclude = {
      select: {
        name: true,
        email: true,
        lease: {
          select: { id: true, name: true, startDate: true, endDate: true, rentAmount: true }
        }
      }
    };

    if (payload.role === 'ADMIN') {
      tickets = await prisma.maintenanceTicket.findMany({
        include: { tenant: tenantInclude },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      tickets = await prisma.maintenanceTicket.findMany({
        where: { tenantId: payload.userId },
        include: { tenant: tenantInclude },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Tickets GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as { userId: string, role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const body = await request.json();
    const { title, description, priority, attachments } = body;
    const safeAttachments = Array.isArray(attachments)
      ? attachments
          .filter((url: unknown) => typeof url === 'string' && url.trim().length > 0)
          .slice(0, 5)
      : [];

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        tenantId: payload.userId,
        attachments: safeAttachments,
      },
      include: {
        tenant: {
          select: {
            name: true,
            email: true,
            lease: {
              select: { id: true, name: true, startDate: true, endDate: true, rentAmount: true }
            }
          }
        }
      }
    });

    // Send notification email (non-blocking)
    try {
      const { sendMaintenanceNotification } = await import('@/lib/email-templates');
      await sendMaintenanceNotification({
        tenantName: ticket.tenant.name || 'Tenant',
        tenantEmail: ticket.tenant.email,
        ticketTitle: title,
        ticketDescription: description,
        priority: priority || 'MEDIUM',
      });
    } catch (emailError) {
      console.error('Failed to send maintenance notification:', emailError);
      // Don't fail ticket creation if email fails
    }

    return NextResponse.json(ticket, { status: 201 });

  } catch (error) {
    console.error('Ticket POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
