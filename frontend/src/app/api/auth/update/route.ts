import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as { userId: string } | null;
    if (!payload?.userId) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const body = await request.json();
    const { name } = body as { name?: string };
    const data: any = {};
    if (typeof name === 'string' && name.trim().length > 0) data.name = name.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const user = await prisma.user.update({ where: { id: payload.userId }, data, select: { id: true, email: true, name: true, role: true, createdAt: true } });
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

