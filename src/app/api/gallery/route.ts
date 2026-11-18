import { NextResponse } from 'next/server';
import { prisma } from '@/backend/config/db';
import { decryptSession } from '@/backend/utils/auth';

// Helper to get session from cookie
function getSession(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  return decryptSession(match[1]);
}

// GET /api/gallery — Fetch all gallery photos & videos
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // 'photos' | 'videos' | null (both)

    const results: Record<string, unknown> = {};

    if (!type || type === 'photos') {
      const galleryPage = await prisma.pageContent.findUnique({
        where: { slug: 'gallery' },
      });
      const fields = galleryPage?.fields as Record<string, string> | null;
      let photos: unknown[] = [];
      if (fields?.gallery_list) {
        try {
          photos = JSON.parse(fields.gallery_list);
        } catch {}
      }
      results.photos = photos;
    }

    if (!type || type === 'videos') {
      const videosPage = await prisma.pageContent.findUnique({
        where: { slug: 'videos' },
      });
      const fields = videosPage?.fields as Record<string, string> | null;
      let videos: unknown[] = [];
      if (fields?.videos_list) {
        try {
          videos = JSON.parse(fields.videos_list);
        } catch {}
      }
      results.videos = videos;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/gallery — Add a new photo or video
export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, item } = body; // type: 'photo' | 'video'

    if (type === 'photo') {
      const page = await prisma.pageContent.findUnique({ where: { slug: 'gallery' } });
      const fields = (page?.fields as Record<string, string>) || {};
      let photos: unknown[] = [];
      if (fields.gallery_list) {
        try { photos = JSON.parse(fields.gallery_list); } catch {}
      }
      photos.push(item);
      await prisma.pageContent.upsert({
        where: { slug: 'gallery' },
        update: { fields: { ...fields, gallery_list: JSON.stringify(photos) } },
        create: { slug: 'gallery', title: 'Galeri Foto', fields: { gallery_list: JSON.stringify(photos) } },
      });
      return NextResponse.json({ success: true, count: photos.length });
    }

    if (type === 'video') {
      const page = await prisma.pageContent.findUnique({ where: { slug: 'videos' } });
      const fields = (page?.fields as Record<string, string>) || {};
      let videos: unknown[] = [];
      if (fields.videos_list) {
        try { videos = JSON.parse(fields.videos_list); } catch {}
      }
      videos.push(item);
      await prisma.pageContent.upsert({
        where: { slug: 'videos' },
        update: { fields: { ...fields, videos_list: JSON.stringify(videos) } },
        create: { slug: 'videos', title: 'Galeri Video', fields: { videos_list: JSON.stringify(videos) } },
      });
      return NextResponse.json({ success: true, count: videos.length });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/gallery — Update entire photo/video list or single item
export async function PUT(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, items, index, item } = body;

    if (type === 'photos') {
      const page = await prisma.pageContent.findUnique({ where: { slug: 'gallery' } });
      const fields = (page?.fields as Record<string, string>) || {};
      
      if (items) {
        // Replace entire list
        await prisma.pageContent.upsert({
          where: { slug: 'gallery' },
          update: { fields: { ...fields, gallery_list: JSON.stringify(items) } },
          create: { slug: 'gallery', title: 'Galeri Foto', fields: { gallery_list: JSON.stringify(items) } },
        });
      } else if (typeof index === 'number' && item) {
        // Update single item
        let photos: unknown[] = [];
        if (fields.gallery_list) {
          try { photos = JSON.parse(fields.gallery_list); } catch {}
        }
        if (index >= 0 && index < photos.length) {
          photos[index] = item;
          await prisma.pageContent.update({
            where: { slug: 'gallery' },
            data: { fields: { ...fields, gallery_list: JSON.stringify(photos) } },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    if (type === 'videos') {
      const page = await prisma.pageContent.findUnique({ where: { slug: 'videos' } });
      const fields = (page?.fields as Record<string, string>) || {};

      if (items) {
        await prisma.pageContent.upsert({
          where: { slug: 'videos' },
          update: { fields: { ...fields, videos_list: JSON.stringify(items) } },
          create: { slug: 'videos', title: 'Galeri Video', fields: { videos_list: JSON.stringify(items) } },
        });
      } else if (typeof index === 'number' && item) {
        let videos: unknown[] = [];
        if (fields.videos_list) {
          try { videos = JSON.parse(fields.videos_list); } catch {}
        }
        if (index >= 0 && index < videos.length) {
          videos[index] = item;
          await prisma.pageContent.update({
            where: { slug: 'videos' },
            data: { fields: { ...fields, videos_list: JSON.stringify(videos) } },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Gallery PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/gallery — Delete a photo or video by index
export async function DELETE(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // 'photo' | 'video'
    const indexStr = url.searchParams.get('index');
    const index = indexStr ? parseInt(indexStr, 10) : -1;

    if (index < 0) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }

    if (type === 'photo') {
      const page = await prisma.pageContent.findUnique({ where: { slug: 'gallery' } });
      const fields = (page?.fields as Record<string, string>) || {};
      let photos: unknown[] = [];
      if (fields.gallery_list) {
        try { photos = JSON.parse(fields.gallery_list); } catch {}
      }
      if (index < photos.length) {
        photos.splice(index, 1);
        await prisma.pageContent.update({
          where: { slug: 'gallery' },
          data: { fields: { ...fields, gallery_list: JSON.stringify(photos) } },
        });
      }
      return NextResponse.json({ success: true, count: photos.length });
    }

    if (type === 'video') {
      const page = await prisma.pageContent.findUnique({ where: { slug: 'videos' } });
      const fields = (page?.fields as Record<string, string>) || {};
      let videos: unknown[] = [];
      if (fields.videos_list) {
        try { videos = JSON.parse(fields.videos_list); } catch {}
      }
      if (index < videos.length) {
        videos.splice(index, 1);
        await prisma.pageContent.update({
          where: { slug: 'videos' },
          data: { fields: { ...fields, videos_list: JSON.stringify(videos) } },
        });
      }
      return NextResponse.json({ success: true, count: videos.length });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
