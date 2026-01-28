import { NextRequest, NextResponse } from 'next/server';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const jar = await cookies();
    let token = jar.get('refreshToken')?.value || null;
    if (!token) {
      const header = request.headers.get('authorization') || request.headers.get('Authorization');
      if (header && header.toLowerCase().startsWith('bearer ')) token = header.slice(7).trim();
    }
    if (!token) return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });

    const payload = verifyRefreshToken(token) as { userId: string; role: string } | null;
    if (!payload) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });

    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    const refreshToken = signRefreshToken({ userId: payload.userId, role: payload.role });

    jar.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15,
      path: '/',
    });
    jar.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ token: accessToken, refreshToken }, { status: 200 });
  } catch (error) {
    console.error('Refresh Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

