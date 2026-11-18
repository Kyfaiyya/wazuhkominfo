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

// Month translation helper
const MONTH_MAP = {
  'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
  'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
  'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
};

function getYearMonthFromDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return { year: '2026', month: '06' };
  
  // Date format: "26 Juni 2026" or similar
  const parts = dateStr.toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0];
    const monthName = parts[1];
    const year = parts[2];
    const month = MONTH_MAP[monthName] || '06';
    return { year, month };
  }
  return { year: '2026', month: '06' };
}

function getCleanFilename(localPath) {
  const base = path.basename(localPath);
  // Match prefix like "1782951526845-" (digits followed by hyphen)
  const clean = base.replace(/^\d+-/, '');
  return clean;
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

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

async function downloadAndUpload(originalFilename, year, month) {
  const targetUrl = `https://diskominfo.penajamkab.go.id/wp-content/uploads/${year}/${month}/${originalFilename}`;
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      // Try fallback to just 2026/06 if failed
      if (year !== '2026' || month !== '06') {
        return downloadAndUpload(originalFilename, '2026', '06');
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || getContentType(originalFilename);

    console.log(`[MinIO] Uploading ${originalFilename} to bucket...`);
    await minioClient.putObject(bucketName, originalFilename, buffer, buffer.length, {
      'Content-Type': contentType,
    });

    return `${minioPublicUrl}/${originalFilename}`;
  } catch (err) {
    console.error(`[Error] Failed to restore ${originalFilename} from ${targetUrl}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('--- STARTING IMAGE RECOVERY AND MINIO UPLOAD ---');

  // Ensure MinIO bucket
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
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
    }
  } catch (err) {
    console.error('[MinIO] Failed to connect to MinIO:', err.message);
    process.exit(1);
  }

  // Load database
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

  console.log(`[Database] Processing ${db.news.length} news articles...`);

  // Map to cache restored URLs to avoid multiple downloads of the same image
  const restoredMap = new Map();

  for (let i = 0; i < db.news.length; i++) {
    const article = db.news[i];
    const { year, month } = getYearMonthFromDate(article.date);

    // 1. Restore cover image
    let needsRestore = false;
    let cleanFile = '';

    if (article.image) {
      if (article.image.startsWith('/uploads/') || article.image.startsWith('uploads/')) {
        needsRestore = true;
        cleanFile = getCleanFilename(article.image);
      } else if (article.image.startsWith(minioPublicUrl)) {
        cleanFile = article.image.replace(`${minioPublicUrl}/`, '').replace(/^\//, '');
        // Check if object exists in MinIO, if not we restore it
        try {
          await minioClient.statObject(bucketName, cleanFile);
        } catch (e) {
          needsRestore = true;
        }
      }
    }

    if (needsRestore && cleanFile) {
      if (restoredMap.has(cleanFile)) {
        article.image = restoredMap.get(cleanFile);
      } else {
        console.log(`[Restore] Cover for article ${i + 1}/${db.news.length}: ${cleanFile}`);
        const minioUrl = await downloadAndUpload(cleanFile, year, month);
        if (minioUrl) {
          article.image = minioUrl;
          restoredMap.set(cleanFile, minioUrl);
        } else if (article.image.startsWith('/uploads/') || article.image.startsWith('uploads/')) {
          article.image = '/uploads/banner-kominfo.jpg'; // fallback
        }
      }
    }

    // 2. Restore images inside content HTML
    const contentImages = [];
    
    // Match local /uploads/ images
    const localImgRegex = /src=["'](?:\/)?uploads\/([^"']+)["']/gi;
    let match;
    while ((match = localImgRegex.exec(article.content || '')) !== null) {
      contentImages.push({
        type: 'local',
        originalSrc: match[0],
        fileWithTimestamp: match[1],
        cleanFile: match[1].replace(/^\d+-/, '')
      });
    }

    // Match MinIO images
    const minioImgRegex = new RegExp(`src=["']${minioPublicUrl}/([^"']+)["']`, 'gi');
    while ((match = minioImgRegex.exec(article.content || '')) !== null) {
      const filename = match[1];
      contentImages.push({
        type: 'minio',
        originalSrc: match[0],
        fileWithTimestamp: filename,
        cleanFile: filename
      });
    }

    for (const item of contentImages) {
      let needsImageRestore = false;
      if (item.type === 'local') {
        needsImageRestore = true;
      } else {
        try {
          await minioClient.statObject(bucketName, item.cleanFile);
        } catch (e) {
          needsImageRestore = true;
        }
      }

      if (needsImageRestore) {
        let minioUrl = restoredMap.get(item.cleanFile);
        if (!minioUrl) {
          console.log(`[Restore] Content Image: ${item.cleanFile}`);
          minioUrl = await downloadAndUpload(item.cleanFile, year, month);
          if (minioUrl) restoredMap.set(item.cleanFile, minioUrl);
        }

        if (minioUrl) {
          if (item.type === 'local') {
            const replaceRegex = new RegExp(`/?uploads/${item.fileWithTimestamp}`, 'g');
            article.content = article.content.replace(replaceRegex, minioUrl);
          }
        }
      }
    }
  }

  // Save changes
  console.log('[Database] Saving local db.json...');
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log('[Database] Local db.json saved.');

  if (redis) {
    console.log('[Database] Saving to Redis (8s timeout)...');
    await withTimeout(redis.set(REDIS_DB_KEY, db), 8000, null);
    console.log('[Database] Redis saved.');
  }

  console.log(`\n--- RECOVERY COMPLETE: Restored ${restoredMap.size} images to MinIO ---`);
}

run();
