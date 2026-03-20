import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    const emailSent = await sendPasswordResetEmail({
      userEmail: email,
      resetLink,
    });

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
