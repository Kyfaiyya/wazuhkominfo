import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/backend/config/db';
import { decryptSession } from '@/backend/utils/auth';
import { sendApiKeyEmail } from '@/backend/utils/email';

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

// Helper to generate a random string for API keys
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'ppu_api_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 1. GET: Admin lists all API requests
export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requests = await prisma.apiRequest.findMany();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('API GET api-requests Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. POST: Public registers for an API credential request
export async function POST(request: Request) {
  try {
    const { name, email, organization, purpose } = await request.json();

    if (!name || !email || !organization || !purpose) {
      return NextResponse.json({ error: 'Semua bidang form (Nama, Email, Instansi, Tujuan) wajib diisi' }, { status: 400 });
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid' }, { status: 400 });
    }

    // Check if email already has a pending or approved request
    const existing = await prisma.apiRequest.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json({ error: 'Email ini sudah memiliki kredensial API yang disetujui' }, { status: 400 });
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'Permintaan API Anda dengan email ini sedang dalam peninjauan admin' }, { status: 400 });
      }
    }

    const newRequest = await prisma.apiRequest.create({
      data: {
        id: 'req_' + Date.now(),
        name,
        email,
        organization,
        purpose,
        status: 'pending',
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('API POST api-requests Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. PUT: Admin approves or rejects a request
export async function PUT(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, status } = await request.json();

    if (!id || !status || (status !== 'approved' && status !== 'rejected' && status !== 'pending')) {
      return NextResponse.json({ error: 'ID dan Status (approved/rejected/pending) wajib diberikan' }, { status: 400 });
    }

    const existing = await prisma.apiRequest.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Permintaan tidak ditemukan' }, { status: 404 });
    }

    const oldStatus = existing.status;
    const updateData: any = { status };

    let emailSent = false;
    if (status === 'approved') {
      const isNewlyApproved = !existing.apiKey || oldStatus !== 'approved';
      if (!existing.apiKey) {
        updateData.apiKey = generateApiKey();
      }
      const updatedRequest = await prisma.apiRequest.update({
        where: { id },
        data: updateData,
      });
      if (isNewlyApproved) {
        emailSent = await sendApiKeyEmail(updatedRequest.email, updatedRequest.name, updatedRequest.apiKey!);
      }
      return NextResponse.json({ success: true, request: updatedRequest, emailSent });
    } else {
      // Clear key if rejected
      updateData.apiKey = null;
      const updatedRequest = await prisma.apiRequest.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, request: updatedRequest, emailSent });
    }
  } catch (error) {
    console.error('API PUT api-requests Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 4. DELETE: Admin deletes a request record
export async function DELETE(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID permintaan wajib dilampirkan' }, { status: 400 });
    }

    const existing = await prisma.apiRequest.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Permintaan tidak ditemukan' }, { status: 404 });
    }

    await prisma.apiRequest.delete({ where: { id } });

    return NextResponse.json({ success: true, request: existing });
  } catch (error) {
    console.error('API DELETE api-requests Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
