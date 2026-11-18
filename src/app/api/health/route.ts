import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptSession } from '@/backend/utils/auth';
import { checkRedisHealth } from '@/backend/config/db';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;

  const payload = decryptSession(sessionCookie.value);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
    return null;
  }
  return payload;
}

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const health = await checkRedisHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { connected: false, configured: false, latencyMs: null, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
