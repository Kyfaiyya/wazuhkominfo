import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import path from 'path';
import fs from 'fs/promises';

// Load env
try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = await fs.readFile(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch (e) {}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Fetching news from PostgreSQL database...');
  const news = await prisma.news.findMany({
    take: 5
  });
  console.log('Sample news from PostgreSQL:');
  for (const item of news) {
    console.log({
      id: item.id,
      title: item.title,
      image: item.image,
      status: item.status,
      date: item.date
    });
  }
  
  const count = await prisma.news.count();
  console.log('Total news in PostgreSQL:', count);
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
