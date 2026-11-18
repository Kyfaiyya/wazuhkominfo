import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/backend/config/db';
import { decryptSession } from '@/backend/utils/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('newsId');

    if (!newsId) {
      return NextResponse.json({ error: 'newsId wajib diisi' }, { status: 400 });
    }

    // Filter comments for this article, sorted oldest first
    const comments = await prisma.comment.findMany({
      where: { newsId },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 });
    }

    const payload = decryptSession(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized: Sesi kedaluwarsa, silakan login kembali' }, { status: 401 });
    }

    const { newsId, content } = await request.json();

    if (!newsId || !content || !content.trim()) {
      return NextResponse.json({ error: 'ID berita dan isi komentar wajib diisi' }, { status: 400 });
    }

    // Find the user details to get their name
    const currentUser = await prisma.user.findFirst({ where: { id: payload.id } });
    if (!currentUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const dateStr = new Date().toLocaleDateString('id-ID', dateOptions);

    const newComment = await prisma.comment.create({
      data: {
        id: Date.now().toString(),
        newsId,
        userEmail: currentUser.username,
        userName: currentUser.name,
        content: content.trim(),
        date: dateStr,
      },
    });

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
