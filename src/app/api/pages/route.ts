import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, backupToRedis } from '@/backend/config/db';
import { decryptSession } from '@/backend/utils/auth';

export const dynamic = 'force-dynamic';

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
    const slug = searchParams.get('slug');

    if (slug) {
      const page = await prisma.pageContent.findFirst({ where: { slug } });
      if (!page) {
        return NextResponse.json({ slug, title: slug, fields: {} });
      }
      return NextResponse.json({
        slug: page.slug,
        title: page.title,
        fields: page.fields as Record<string, string>,
      });
    }

    // Self-healing database: automatically synchronize dropdown links to pageContents records
    const navMenu = await prisma.pageContent.findFirst({ where: { slug: 'navigation-menu' } });
    if (navMenu) {
      const navFields = navMenu.fields as Record<string, string>;
      const parseLinks = (val?: string) => {
        try {
          return val ? JSON.parse(val) : [];
        } catch {
          return [];
        }
      };

      const categories = [
        { key: 'profil_links', prefix: 'profil' },
        { key: 'ppid_links', prefix: 'ppid' },
        { key: 'informasi_links', prefix: 'informasi' },
        { key: 'layanan_links', prefix: 'layanan' },
        { key: 'download_links', prefix: 'download' },
        { key: 'gallery_links', prefix: 'gallery' },
      ];

      const hrefToSlugMap: Record<string, string> = {
        '/profil/diskominfo-sandi': 'diskominfo-sandi',
        '/profil/visi-misi': 'visi-misi',
        '/profil/tupoksi': 'tupoksi',
        '/profil/struktur-organisasi': 'struktur-organisasi',
        '/profil/organisasi': 'organisasi',
        '/ppid/sarana-prasarana': 'ppid-sarana-prasarana',
        '/ppid/komitmen-organisasi': 'ppid-komitmen',
        '/ppid/informasi-berkala': 'ppid-informasi-berkala',
        '/informasi/kegiatan': 'informasi-kegiatan',
        '/informasi/agenda': 'informasi-agenda',
        '/informasi/pengumuman': 'informasi-pengumuman',
        '/informasi/dpa': 'dpa',
        '/gallery/foto': 'gallery-foto',
        '/gallery/video': 'gallery-video',
        '/layanan/pengaduan-masyarakat': 'layanan-pengaduan-masyarakat',
        '/layanan/subdomain-dan-hosting': 'layanan-subdomain-dan-hosting',
        '/layanan/tanda-tangan-elektronik': 'layanan-tanda-tangan-elektronik',
        '/layanan/fasilitas-video-conference': 'layanan-fasilitas-video-conference',
        '/download/regulasi': 'download-regulasi',
        '/download/materi': 'download-materi',
        '/download/dokumen-teknis': 'download-dokumen-teknis'
      };

      // Fetch all existing slugs in a single query
      const existingPages = await prisma.pageContent.findMany({ select: { slug: true } });
      const existingSlugs = new Set(existingPages.map(p => p.slug));

      for (const cat of categories) {
        const links = parseLinks(navFields[cat.key]);
        for (const link of links) {
          if (!link || typeof link.href !== 'string') {
            continue;
          }
          // Skip external links or links containing query parameters (like /peta?tab=bts)
          if (link.href.startsWith('http') || link.href.includes('?') || link.href === '/peta' || link.href.startsWith('/peta?')) {
            continue;
          }

          const cleanHref = link.href.split('?')[0];
          const pathSlug = cleanHref.split('/').pop();
          if (!pathSlug) continue;

          const expectedSlug = hrefToSlugMap[cleanHref] || `${cat.prefix}-${pathSlug}`;
          
          // Verify if page record exists in memory
          if (!existingSlugs.has(expectedSlug)) {
            // Determine default fields
            const defaultFields: Record<string, string> = cat.prefix === 'layanan'
              ? {
                  page_title: link.name,
                  page_description: 'Informasi lengkap dan prosedur akses layanan publik Diskominfo.',
                  content_heading: 'Informasi & Prosedur Layanan',
                  content_body: '## Deskripsi Layanan\n\nLayanan ini disediakan oleh Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara untuk memfasilitasi kebutuhan publik.\n\n### Prosedur Pengajuan:\n1. Pastikan Anda memenuhi dokumen persyaratan.\n2. Klik tombol tautan pendaftaran di bawah ini untuk mengisi formulir online.\n3. Tunggu proses verifikasi berkas oleh admin.',
                  button_text: 'Formulir Pendaftaran',
                  button_url: 'https://forms.google.com',
                }
              : {
                  page_title: link.name,
                  page_description: 'Deskripsi halaman baru ini. Aktifkan Mode Edit untuk menyesuaikan isi konten.',
                  content_heading: 'Detail Informasi',
                  content_body: '## Selamat Datang\n\nIni adalah halaman baru yang dibuat secara dinamis.\n\n### Cara Mengedit:\n- Aktifkan **Mode Edit** di bilah administrator atas.\n- Gunakan toolbar editor di bawah untuk menambahkan **Headline**, **Subheadline**, **Teks Tebal**, atau **Daftar Bulat**.\n- Anda juga dapat langsung mengunggah gambar dari komputer Anda dengan mengeklik tombol **Tambah Gambar**.',
                };

            try {
              await prisma.pageContent.create({
                data: {
                  slug: expectedSlug,
                  title: link.name,
                  fields: defaultFields,
                },
              });
              existingSlugs.add(expectedSlug);
              console.log(`[Database] Auto-healed: created missing page record "${expectedSlug}".`);
            } catch (createErr: any) {
              // Skip if page already exists (race condition or duplicate slug)
              if (createErr?.code !== 'P2002') {
                console.error(`[Database] Failed to auto-heal page "${expectedSlug}":`, createErr);
              }
            }
          }
        }
      }
    }

    const allPages = await prisma.pageContent.findMany();
    return NextResponse.json(allPages.map(p => ({
      slug: p.slug,
      title: p.title,
      fields: p.fields as Record<string, string>,
    })));
  } catch (error) {
    console.error('API GET pages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { slug, fields, title } = await request.json();

    if (!slug || !fields) {
      return NextResponse.json({ error: 'Slug dan fields wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.pageContent.findFirst({ where: { slug } });

    if (!existing) {
      // Auto-create page if it doesn't exist (upsert behavior)
      const newPage = await prisma.pageContent.create({
        data: {
          slug,
          title: title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          fields,
        },
      });
      backupToRedis();
      return NextResponse.json({ success: true, page: { slug: newPage.slug, title: newPage.title, fields: newPage.fields } });
    }

    // Update: merge fields
    const mergedFields = { ...(existing.fields as Record<string, string>), ...fields };
    const updated = await prisma.pageContent.update({
      where: { slug },
      data: { fields: mergedFields },
    });

    backupToRedis();

    return NextResponse.json({ success: true, page: { slug: updated.slug, title: updated.title, fields: updated.fields } });
  } catch (error) {
    console.error('API PUT pages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. POST: Superadmin creates a brand new page record
export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { slug, title, fields } = await request.json();

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug dan Judul Halaman wajib diisi' }, { status: 400 });
    }

    // Clean slug format: lower case, alphanumeric and hyphens only
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    const exists = await prisma.pageContent.findFirst({ where: { slug: cleanSlug } });
    if (exists) {
      return NextResponse.json({ error: 'Halaman dengan slug ini sudah terdaftar' }, { status: 400 });
    }

    const newPage = await prisma.pageContent.create({
      data: {
        slug: cleanSlug,
        title,
        fields: fields || {
          deskripsi: 'Deskripsi halaman baru ini. Silakan sesuaikan kontennya.',
          content_body: '## Konten Halaman Baru\n\nSilakan tulis isi konten halaman di sini.',
        },
      },
    });

    backupToRedis();

    return NextResponse.json({ success: true, page: { slug: newPage.slug, title: newPage.title, fields: newPage.fields } });
  } catch (error) {
    console.error('API POST pages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 4. DELETE: Superadmin deletes a page record
export async function DELETE(request: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug halaman wajib dilampirkan' }, { status: 400 });
    }

    const existing = await prisma.pageContent.findFirst({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    // Don't allow deleting system core pages
    const corePages = ['hero', 'visi-misi', 'kontak', 'footer', 'quick-services', 'statistics', 'faq', 'videos', 'gallery', 'partners', 'header-topbar'];
    if (corePages.includes(slug)) {
      return NextResponse.json({ error: 'Tidak dapat menghapus halaman inti sistem' }, { status: 400 });
    }

    await prisma.pageContent.delete({ where: { slug } });

    backupToRedis();

    return NextResponse.json({ success: true, page: { slug: existing.slug, title: existing.title, fields: existing.fields } });
  } catch (error) {
    console.error('API DELETE pages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
