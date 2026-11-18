import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';

const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');

async function main() {
  console.log('--- STARTING SEED TO POSTGRESQL ---');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  // 1. Read JSON file
  let localDb;
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    localDb = JSON.parse(data);
    console.log('[Local File] Successfully read db.json');
  } catch (err) {
    console.error('[Error] Failed to read db.json:', err.message);
    process.exit(1);
  }

  // 2. Clear existing records to ensure clean sync (optional but good for a fresh start)
  console.log('[Database] Clearing existing records...');
  await prisma.user.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.pageContent.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.mapPoint.deleteMany({});
  await prisma.apiRequest.deleteMany({});
  console.log('[Database] Existing records cleared.');

  // 3. Migrate Users
  if (localDb.users && localDb.users.length > 0) {
    console.log(`[Database] Seeding ${localDb.users.length} users...`);
    await prisma.user.createMany({
      data: localDb.users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
      })),
    });
  }

  // 4. Migrate News
  if (localDb.news && localDb.news.length > 0) {
    console.log(`[Database] Seeding ${localDb.news.length} news articles...`);
    // Some news objects might have additional properties or format mismatches. Let's map them safely.
    await prisma.news.createMany({
      data: localDb.news.map((n) => ({
        id: n.id,
        title: n.title,
        excerpt: n.excerpt || '',
        content: n.content || '',
        date: n.date || '',
        category: n.category || 'BERITA TERKINI',
        author: n.author || '',
        image: n.image || '',
      })),
    });
  }

  // 5. Migrate Announcements
  if (localDb.announcements && localDb.announcements.length > 0) {
    console.log(`[Database] Seeding ${localDb.announcements.length} announcements...`);
    await prisma.announcement.createMany({
      data: localDb.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        date: a.date || '',
        type: a.type || 'PENGUMUMAN',
        urgent: typeof a.urgent === 'boolean' ? a.urgent : false,
        desc: a.desc || '',
      })),
    });
  }

  // 6. Migrate PageContents
  if (localDb.pageContents && localDb.pageContents.length > 0) {
    console.log(`[Database] Seeding ${localDb.pageContents.length} page contents...`);
    await prisma.pageContent.createMany({
      data: localDb.pageContents.map((pc) => ({
        slug: pc.slug,
        title: pc.title,
        fields: pc.fields || {},
      })),
    });
  }

  // 7. Migrate Comments
  if (localDb.comments && localDb.comments.length > 0) {
    console.log(`[Database] Seeding ${localDb.comments.length} comments...`);
    await prisma.comment.createMany({
      data: localDb.comments.map((c) => ({
        id: c.id,
        newsId: c.newsId,
        userEmail: c.userEmail,
        userName: c.userName,
        content: c.content,
        date: c.date,
      })),
    });
  }

  // 8. Migrate MapPoints
  // If mapPoints is not in localDb, we can fall back to the default map points or check if it exists
  const mapPointsData = localDb.mapPoints || [];
  if (mapPointsData.length > 0) {
    console.log(`[Database] Seeding ${mapPointsData.length} map points...`);
    await prisma.mapPoint.createMany({
      data: mapPointsData.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        lat: parseFloat(m.lat),
        lng: parseFloat(m.lng),
        status: m.status,
        details: m.details,
        location: m.location,
        videoId: m.videoId || null,
      })),
    });
  }

  // 9. Migrate ApiRequests
  const apiRequestsData = localDb.apiRequests || [];
  if (apiRequestsData.length > 0) {
    console.log(`[Database] Seeding ${apiRequestsData.length} API requests...`);
    await prisma.apiRequest.createMany({
      data: apiRequestsData.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        organization: r.organization,
        purpose: r.purpose,
        status: r.status,
        date: r.date,
        apiKey: r.apiKey || null,
      })),
    });
  }

  console.log('[Database] Database seeding complete!');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error('[Error] Seeding failed with error:', e);
  process.exit(1);
});
