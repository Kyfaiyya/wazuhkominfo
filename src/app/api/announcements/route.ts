import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptSession } from '@/backend/utils/auth';
import { AnnouncementController } from '@/backend/controllers/AnnouncementController';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await AnnouncementController.get(id);
    if (id && !result) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, type, urgent, desc } = await request.json();
    if (!title || !desc) {
      return NextResponse.json({ error: 'Judul dan deskripsi pengumuman wajib diisi' }, { status: 400 });
    }

    const announcement = await AnnouncementController.create({ title, type, urgent, desc });
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, title, type, urgent, desc } = await request.json();
    if (!id || !title || !desc) {
      return NextResponse.json({ error: 'ID, judul, dan deskripsi pengumuman wajib diisi' }, { status: 400 });
    }

    const announcement = await AnnouncementController.update(id, { title, type, urgent, desc });
    if (!announcement) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams = new URL(request.url).searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID pengumuman wajib diberikan' }, { status: 400 });
    }

    const success = await AnnouncementController.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
