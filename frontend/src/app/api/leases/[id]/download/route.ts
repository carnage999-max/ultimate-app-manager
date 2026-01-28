import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthToken } from '@/lib/auth';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const token = await getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const auth = verifyToken(token) as { userId: string; role: string } | null;
    if (!auth) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { id } = await ctx.params;
    const lease = await prisma.lease.findUnique({ where: { id } });
    if (!lease) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    if (auth.role !== 'ADMIN' && lease.tenantId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!lease.documentUrl) {
      return NextResponse.json({ error: 'No document associated with this lease' }, { status: 404 });
    }

    // If documentUrl already looks like a URL, return it directly
    if (/^https?:\/\//i.test(lease.documentUrl)) {
      return NextResponse.json({ url: lease.documentUrl });
    }

    // Assume documentUrl is an object key
    const key = lease.documentUrl.startsWith('/') ? lease.documentUrl.slice(1) : lease.documentUrl;
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 10 }); // 10 minutes
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Lease Download Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

