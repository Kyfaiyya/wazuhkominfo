import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, backupToRedis } from '@/backend/config/db';
import { decryptSession } from '@/backend/utils/auth';

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
    const mapPoints = await prisma.mapPoint.findMany();
    return NextResponse.json(mapPoints);
  } catch (error) {
    console.error('API GET mapPoints Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, category, lat, lng, status, details, location, videoId } = await request.json();

    if (!name || !category || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Nama, Kategori, Latitude, dan Longitude wajib diisi' }, { status: 400 });
    }

    const newPoint = await prisma.mapPoint.create({
      data: {
        id: 'pt-' + Date.now(),
        name,
        category,
        lat: Number(lat),
        lng: Number(lng),
        status: status || 'Aktif',
        details: details || '',
        location: location || 'Kec. Penajam',
        videoId: videoId || null,
      },
    });

    backupToRedis();

    return NextResponse.json({ success: true, point: newPoint });
  } catch (error) {
    console.error('API POST mapPoints Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID wajib dilampirkan' }, { status: 400 });
    }

    const existing = await prisma.mapPoint.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Titik koordinat tidak ditemukan' }, { status: 404 });
    }

    await prisma.mapPoint.delete({ where: { id } });

    backupToRedis();

    return NextResponse.json({ success: true, point: existing });
  } catch (error) {
    console.error('API DELETE mapPoints Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, name, category, lat, lng, status, details, location, videoId } = await request.json();

    if (!id || !name || !category || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'ID, Nama, Kategori, Latitude, dan Longitude wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.mapPoint.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Titik koordinat tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.mapPoint.update({
      where: { id },
      data: {
        name,
        category,
        lat: Number(lat),
        lng: Number(lng),
        status: status || 'Aktif',
        details: details || '',
        location: location || 'Kec. Penajam',
        videoId: videoId || null,
      },
    });

    backupToRedis();

    return NextResponse.json({ success: true, point: updated });
  } catch (error) {
    console.error('API PUT mapPoints Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
