import { NextResponse } from 'next/server';
import { prisma } from '@/backend/config/db';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (!q.trim()) {
      return NextResponse.json({ news: [], announcements: [], pages: [] });
    }

    // Search news using Prisma
    const newsResults = await prisma.news.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
    });

    const formattedNews = newsResults.map((item) => {
      const parts = (item.date || '').split(' ');
      const year = parts[2] || '2026';
      const month = slugify(parts[1] || 'januari');
      const titleSlug = slugify(item.title || '');
      return {
        id: item.id,
        title: item.title,
        snippet: item.excerpt || (item.content ? item.content.slice(0, 100) + '...' : ''),
        date: item.date,
        href: `/berita/${year}/${month}/${titleSlug}`,
      };
    });

    // Search announcements using Prisma
    const announcementResults = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { desc: { contains: q, mode: 'insensitive' } },
        ],
      },
    });

    const formattedAnnouncements = announcementResults.map((item) => ({
      id: item.id,
      title: item.title,
      snippet: item.desc.slice(0, 120) + (item.desc.length > 120 ? '...' : ''),
      date: item.date,
      href: `/informasi/pengumuman/${item.id}`,
    }));

    return NextResponse.json({
      news: formattedNews,
      announcements: formattedAnnouncements,
      pages: [],
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
