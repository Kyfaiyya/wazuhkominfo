import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';
import * as Minio from 'minio';

const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');
const REDIS_DB_KEY = "diskominfo:database";

// Load env variables
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
  console.log('No .env.local file loaded, proceeding with default process.env');
}

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'webkominfo';
const minioPublicUrl = (process.env.MINIO_PUBLIC_URL || `http://localhost:9000/${bucketName}`).replace(/\/$/, '');

// Timeout helper
function withTimeout(promise, ms, defaultValue = null) {
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout of ${ms}ms`)), ms);
  });
  return Promise.race([
    promise.then(res => { clearTimeout(timeoutId); return res; }),
    timeoutPromise
  ]).catch(err => {
    console.warn(`[Timeout] ${err.message}`);
    return defaultValue;
  });
}

async function run() {
  console.log('--- STARTING FALLBACK MIGRATION TO MINIO ---');

  // 1. Ensure MinIO bucket exists and is public
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`[MinIO] Bucket "${bucketName}" does not exist. Creating...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      }],
    };
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`[MinIO] Bucket "${bucketName}" access policy set to public read-only.`);
  } catch (err) {
    console.error('[MinIO] Failed to connect to MinIO:', err.message);
    process.exit(1);
  }

  // 2. Download and upload the default banner to MinIO
  let bannerMinioUrl = `${minioPublicUrl}/banner-kominfo.jpg`;
  try {
    console.log('[MinIO] Uploading default banner-kominfo.jpg...');
    const bannerSourceUrl = 'https://diskominfo.penajamkab.go.id/wp-content/uploads/2023/02/BANNER-KOMINFO.jpg';
    const res = await fetch(bannerSourceUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await minioClient.putObject(bucketName, 'banner-kominfo.jpg', buffer, buffer.length, {
      'Content-Type': 'image/jpeg',
    });
    console.log(`[MinIO] Default banner uploaded: ${bannerMinioUrl}`);
  } catch (err) {
    console.error('[MinIO] Failed to upload default banner to MinIO:', err.message);
    process.exit(1);
  }

  // 3. Load database
  let db;
  let redis = null;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = Redis.fromEnv();
    } catch (err) {}
  }

  if (redis) {
    console.log('[Database] Reading from Redis (8s timeout)...');
    db = await withTimeout(redis.get(REDIS_DB_KEY), 8000, null);
  }

  if (!db) {
    console.log('[Database] Reading from local db.json...');
    const localData = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(localData);
  }

  if (!db || !Array.isArray(db.news)) {
    console.error('[Error] Invalid database schema');
    process.exit(1);
  }

  // 4. Replace all local /uploads/ URLs with the MinIO default banner URL
  let updatedCount = 0;
  for (const article of db.news) {
    // Check cover image
    if (article.image && (article.image.startsWith('/uploads/') || article.image.startsWith('uploads/'))) {
      article.image = bannerMinioUrl;
      updatedCount++;
    }
    // Check inline content images
    if (article.content && (article.content.includes('/uploads/') || article.content.includes('uploads/'))) {
      article.content = article.content.replace(/src=["']\/uploads\/[^"']+["']/gi, `src="${bannerMinioUrl}"`);
      article.content = article.content.replace(/src=["']uploads\/[^"']+["']/gi, `src="${bannerMinioUrl}"`);
      updatedCount++;
    }
  }

  // Update page contents as well
  if (Array.isArray(db.pageContents)) {
    for (const page of db.pageContents) {
      if (page.fields) {
        for (const key of Object.keys(page.fields)) {
          if (page.fields[key] && (page.fields[key].includes('/uploads/') || page.fields[key].includes('uploads/'))) {
            page.fields[key] = page.fields[key].replace(/src=["']\/uploads\/[^"']+["']/gi, `src="${bannerMinioUrl}"`);
            page.fields[key] = page.fields[key].replace(/src=["']uploads\/[^"']+["']/gi, `src="${bannerMinioUrl}"`);
            updatedCount++;
          }
        }
      }
    }
  }

  // 5. Save database
  console.log('[Database] Saving local db.json...');
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log('[Database] Local db.json saved.');

  if (redis) {
    console.log('[Database] Saving to Redis (8s timeout)...');
    await withTimeout(redis.set(REDIS_DB_KEY, db), 8000, null);
    console.log('[Database] Redis saved.');
  }

  console.log(`\n--- MIGRATION COMPLETE: Mapped all local upload paths to MinIO Default Banner ---`);
}

run();
