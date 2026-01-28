import { resend } from './email';

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
}

export async function sendWelcomeEmail({ userName, userEmail }: WelcomeEmailProps) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: userEmail,
      subject: 'Welcome to Ultimate Apartment Manager!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to Ultimate Apartment Manager</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">Ultimate Apartment Manager</h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0;">Your Property Management Journey Starts Here</p>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}!</h2>
              <p style="color: #475569; font-size: 16px;">
                Thank you for joining <strong>Ultimate Apartment Manager</strong>! We're excited to help you streamline your property management experience.
              </p>
              <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Getting Started</h3>
                <ul style="color: #475569; padding-left: 20px; margin: 10px 0;">
                  <li style="margin: 8px 0;">Complete your profile in the dashboard</li>
                  <li style="margin: 8px 0;">View your lease details and payment schedule</li>
                  <li style="margin: 8px 0;">Submit maintenance requests anytime</li>
                  <li style="margin: 8px 0;">Enable online rent payments for convenience</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #1e293b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
              </div>
              <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Pro Tip:</strong> Bookmark the dashboard for quick access.</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="color: #64748b; font-size: 14px; margin: 0;">Need help? Reply to this email or contact our support team.</p>
              <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">Best regards,<br /><strong style="color: #1e293b;">The Ultimate Apartment Manager Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 5px 0;">© 2026 Ultimate Apartment Manager. All rights reserved.</p>
              <p style="margin: 5px 0;">This email was sent to ${userEmail}</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Welcome Email Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Welcome Email Error:', error);
    return false;
  }
}

interface MaintenanceNotificationProps {
  tenantName: string;
  tenantEmail: string;
  ticketTitle: string;
  ticketDescription: string;
  priority: string;
}

export async function sendMaintenanceNotification({
  tenantName,
  tenantEmail,
  ticketTitle,
  ticketDescription,
  priority,
}: MaintenanceNotificationProps) {
  const priorityColors: Record<string, string> = {
    URGENT: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#3b82f6',
    LOW: '#64748b',
  };

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: tenantEmail,
      subject: `Maintenance Request Received: ${ticketTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e293b; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">Maintenance Request Received</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #475569;">Hi ${tenantName},</p>
              <p style="color: #475569;">We've received your maintenance request and our team will address it shortly.</p>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${priorityColors[priority] || '#3b82f6'};">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">Request Details</h3>
                <p style="margin: 5px 0;"><strong>Title:</strong> ${ticketTitle}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${priorityColors[priority]}; font-weight: 600;">${priority}</span></p>
                <p style="margin: 10px 0 0 0;"><strong>Description:</strong></p>
                <p style="color: #64748b; margin: 5px 0;">${ticketDescription}</p>
              </div>
              <p style="color: #475569; font-size: 14px;">You can track the status of your request in your dashboard.</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${SITE_URL}/dashboard/maintenance" style="display: inline-block; background: #1e293b; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Request Status</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
              <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you,<br /><strong style="color: #1e293b;">Ultimate Apartment Manager Team</strong></p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Maintenance Notification Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Maintenance Notification Error:', error);
    return false;
  }
}

interface MaintenanceAttendedEmailProps {
  tenantName: string;
  tenantEmail: string;
  ticketTitle: string;
}

export async function sendMaintenanceAttendedEmail({
  tenantName,
  tenantEmail,
  ticketTitle,
}: MaintenanceAttendedEmailProps) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: tenantEmail,
      subject: `Maintenance Request Attended: ${ticketTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #16a34a, #0d9488); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">Maintenance Request Attended</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #475569;">Hi ${tenantName},</p>
              <p style="color: #475569;">Your maintenance request <strong>"${ticketTitle}"</strong> has been attended to by our team.</p>
              <div style="background: #ecfdf5; padding: 20px; border-left: 4px solid #16a34a; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;">If you still notice any issues, please reply to this email or submit another request.</p>
              </div>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${SITE_URL}/dashboard/maintenance" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Request</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
              <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you,<br /><strong style="color: #1e293b;">Ultimate Apartment Manager Team</strong></p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Maintenance Attended Email Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Maintenance Attended Email Error:', error);
    return false;
  }
}
