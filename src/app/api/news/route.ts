import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptSession, validateApiKey } from '@/backend/utils/auth';
import { NewsController } from '@/backend/controllers/NewsController';

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
    // Validate API Access Credentials
    const isValid = await validateApiKey(request);
    if (!isValid) {
      return NextResponse.json({
        error: 'Unauthorized: Akses ditolak. Silakan sertakan parameter ?api_key=[token] atau header Authorization Bearer token Anda. Daftar kredensial API secara mandiri di /pendaftaran-api'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // 1. Get single article by ID
    if (id) {
      const article = await NewsController.getById(id);
      if (!article) {
        return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(article);
    }

    // 2. Get single article by slug
    if (slug) {
      const article = await NewsController.getBySlug(slug);
      if (!article) {
        return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(article);
    }

    // 3. Get filtered/paginated list
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const offset = offsetParam ? parseInt(offsetParam, 10) : null;

    const result = await NewsController.getFiltered({
      category,
      search,
      status,
      limit,
      offset
    });

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

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Judul dan konten berita wajib diisi' }, { status: 400 });
    }

    const article = await NewsController.create(auth.id, auth.username, body);
    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('API news POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, content } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, judul, dan konten berita wajib diisi' }, { status: 400 });
    }

    const article = await NewsController.update(body);
    if (!article) {
      return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('API news PUT error:', error);
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
      return NextResponse.json({ error: 'ID berita wajib diberikan' }, { status: 400 });
    }

    const success = await NewsController.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
