import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete the token used
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
