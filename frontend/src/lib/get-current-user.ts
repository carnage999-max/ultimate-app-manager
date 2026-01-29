import { cookies } from 'next/headers';
import { prisma } from './db';
import { verifyToken } from './auth';

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'TENANT';
  createdAt: Date;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;

    const payload = verifyToken(token) as { userId?: string } | null;
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) return null;

    return user as CurrentUser;
  } catch (error) {
    console.error('getCurrentUser error', error);
    return null;
  }
}
