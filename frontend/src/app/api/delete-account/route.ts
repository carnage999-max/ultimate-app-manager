import { NextResponse } from 'next/server';
import { resend } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email, reason } = await request.json();
    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const subject = `Account Deletion Request — ${email}`;
    const html = `
      <h2>Account Deletion Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>This request was submitted from the public delete-account page.</p>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'support@ultimateapartmentmanager.com',
      to: process.env.SUPPORT_EMAIL || (process.env.RESEND_FROM_EMAIL || 'support@ultimateapartmentmanager.com'),
      subject,
      html,
    });

    if (error) {
      console.error('Delete Account Email Error:', error);
      return NextResponse.json({ error: 'Unable to send request' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

