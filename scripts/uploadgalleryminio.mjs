/**
 * uploadgalleryminio.mjs
 * 
 * Uploads all scraped gallery images/thumbnails from public/gallery-images/
 * to the MinIO 'webkominfo' bucket, and updates their URLs in db.json,
 * PostgreSQL, and Redis.
 * 
 * Usage: node scripts/uploadgalleryminio.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import * as Minio from 'minio';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Redis } from '@upstash/redis';

// Load .env.local manually to ensure local config variables are set
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
} catch (e) {
  console.log('No .env.local loaded, using defaults.');
}

const GALLERY_DIR = path.join(process.cwd(), 'public', 'gallery-images');
const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');
const REDIS_DB_KEY = "diskominfo:database";

// Setup MinIO Client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'webkominfo';
const minioPublicUrl = (process.env.MINIO_PUBLIC_URL || `http://localhost:9000/${bucketName}`).replace(/\/$/, '');

// Helper to determine content type
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

async function run() {
  console.log('--- STARTING GALLERY IMAGES TO MINIO MIGRATION ---');

  // 1. Ensure MinIO bucket exists
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`[MinIO] Bucket "${bucketName}" does not exist. Creating...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    } else {
      console.log(`[MinIO] Bucket "${bucketName}" exists.`);
    }
  } catch (err) {
    console.error('[MinIO] Bucket setup failed:', err.message);
    process.exit(1);
  }

  // 2. Read local gallery-images folder files
  let files = [];
  try {
    files = await fs.readdir(GALLERY_DIR);
    console.log(`[Local] Found ${files.length} files in public/gallery-images/`);
  } catch (err) {
    console.error(`[Local] Error reading public/gallery-images/ folder:`, err.message);
    process.exit(1);
  }

  // 3. Upload files to MinIO
  console.log(`[Upload] Uploading ${files.length} files to MinIO...`);
  let successCount = 0;
  for (const filename of files) {
    const filePath = path.join(GALLERY_DIR, filename);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) continue;

    try {
      // Check if file already exists in MinIO
      let alreadyExists = false;
      try {
        await minioClient.statObject(bucketName, filename);
        alreadyExists = true;
      } catch (e) {}

      if (alreadyExists) {
        console.log(`   [MinIO] Already exists: ${filename}`);
        successCount++;
        continue;
      }

      const buffer = await fs.readFile(filePath);
      const contentType = getContentType(filename);
      
      await minioClient.putObject(bucketName, filename, buffer, buffer.length, {
        'Content-Type': contentType,
      });
      console.log(`   [MinIO] Uploaded: ${filename}`);
      successCount++;
    } catch (err) {
      console.error(`   [MinIO] Failed to upload "${filename}":`, err.message);
    }
  }
  console.log(`[Upload] Uploaded ${successCount}/${files.length} successfully.`);

  // 4. Update db.json
  let db;
  try {
    const localData = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(localData);
    console.log('[Database] db.json read successfully');
  } catch (err) {
    console.error('[Database] Failed to read db.json:', err.message);
    process.exit(1);
  }

  if (db) {
    console.log('[Database] Replacing local paths with MinIO URLs...');
    const replaceUrls = (text) => {
      if (!text || typeof text !== 'string') return text;
      // Replace /gallery-images/filename with minioPublicUrl/filename
      return text.replace(/\/gallery-images\/([^\/\s"'>\)]+)/g, (match, filename) => {
        return `${minioPublicUrl}/${filename}`;
      });
    };

    // Update news articles, comments, announcements
    if (Array.isArray(db.pageContents)) {
      for (const page of db.pageContents) {
        if (page.fields) {
          for (const key of Object.keys(page.fields)) {
            page.fields[key] = replaceUrls(page.fields[key]);
          }
        }
      }
    }

    // Save db.json
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('[Database] db.json updated and saved.');

    // 5. Update PostgreSQL
    console.log('[PostgreSQL] Syncing updated fields to PostgreSQL...');
    
    // Choose local PostgreSQL port (DATABASE_URL in .env uses localhost:5433, .env.local uses localhost:5432)
    // Let's use standard database connection
    const dbUrl = process.env.DATABASE_URL;
    console.log(`[PostgreSQL] Connection URL: ${dbUrl}`);
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
      // Find current pageContents
      const dbGallery = await prisma.pageContent.findUnique({ where: { slug: 'gallery' } });
      if (dbGallery) {
        const fields = dbGallery.fields;
        if (fields && fields.gallery_list) {
          fields.gallery_list = replaceUrls(fields.gallery_list);
          await prisma.pageContent.update({
            where: { slug: 'gallery' },
            data: { fields },
          });
          console.log('[PostgreSQL] Gallery pageContent updated successfully');
        }
      }

      const dbVideos = await prisma.pageContent.findUnique({ where: { slug: 'videos' } });
      if (dbVideos) {
        const fields = dbVideos.fields;
        if (fields && fields.videos_list) {
          fields.videos_list = replaceUrls(fields.videos_list);
          await prisma.pageContent.update({
            where: { slug: 'videos' },
            data: { fields },
          });
          console.log('[PostgreSQL] Videos pageContent updated successfully');
        }
      }
    } catch (err) {
      console.error('[PostgreSQL] Sync failed:', err.message);
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }

    // 6. Update Redis Cache
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        console.log('[Redis] Syncing to Redis...');
        const redis = Redis.fromEnv();
        await redis.set(REDIS_DB_KEY, db);
        console.log('[Redis] Redis cache synced successfully.');
      } catch (err) {
        console.error('[Redis] Sync failed:', err.message);
      }
    }
  }

  console.log('--- GALLERY IMAGES TO MINIO MIGRATION COMPLETED ---');
}

run();
