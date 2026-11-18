import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';
import * as Minio from 'minio';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');
const REDIS_DB_KEY = "diskominfo:database";

// 1. Load .env.local manually
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

// 2. Setup MinIO Client
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
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

// Helper for setting a timeout on promises
function withTimeout(promise, ms, defaultValue = null) {
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${ms}ms exceeded`));
    }, ms);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]).catch((err) => {
    console.warn(`[Timeout] Operation failed or timed out: ${err.message}`);
    return defaultValue;
  });
}

// Main migration runner
async function run() {
  console.log('--- STARTING LOCAL UPLOADS TO MINIO MIGRATION ---');

  // A. Ensure MinIO bucket exists and is public
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
      console.log(`[MinIO] Bucket "${bucketName}" created and public read-only policy set.`);
    } else {
      console.log(`[MinIO] Bucket "${bucketName}" exists.`);
    }
  } catch (err) {
    console.error('[MinIO] Connection or bucket setup failed:', err.message);
    process.exit(1);
  }

  // B. Read local uploads folder files
  let files = [];
  try {
    files = await fs.readdir(UPLOADS_DIR);
    console.log(`[Local] Found ${files.length} files in public/uploads/`);
  } catch (err) {
    console.log(`[Local] No public/uploads/ folder found or it is empty. Skipping file upload.`);
  }

  // C. Upload files to MinIO concurrently (with 25 parallel workers)
  const uploadedFilesMap = new Map();
  const CONCURRENCY = 25;
  const queue = [...files];
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  const worker = async () => {
    while (queue.length > 0) {
      const filename = queue.shift();
      if (!filename) continue;

      const filePath = path.join(UPLOADS_DIR, filename);
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) continue;

        // Check if file already exists in MinIO to avoid re-uploading
        let alreadyExists = false;
        try {
          await minioClient.statObject(bucketName, filename);
          alreadyExists = true;
        } catch (e) {
          // Doesn't exist, proceed with upload
        }

        const newUrl = `${minioPublicUrl}/${filename}`;
        uploadedFilesMap.set(`/uploads/${filename}`, newUrl);
        uploadedFilesMap.set(`uploads/${filename}`, newUrl);

        if (alreadyExists) {
          skipCount++;
          if (skipCount % 100 === 0) {
            console.log(`[Skip] ${skipCount} files already exist in MinIO...`);
          }
          continue;
        }

        const buffer = await fs.readFile(filePath);
        const contentType = getContentType(filename);
        
        await minioClient.putObject(bucketName, filename, buffer, buffer.length, {
          'Content-Type': contentType,
        });
        successCount++;
        if (successCount % 50 === 0) {
          console.log(`[Upload] Uploaded ${successCount} new files...`);
        }
      } catch (err) {
        failCount++;
        console.error(`[Upload Failed] "${filename}":`, err.message);
      }
    }
  };

  console.log(`[Upload] Running upload with ${CONCURRENCY} parallel workers...`);
  await Promise.all(Array.from({ length: CONCURRENCY }).map(worker));
  console.log(`[Upload] Done: ${successCount} uploaded, ${skipCount} skipped, ${failCount} failed.`);

  console.log(`\n[Upload] Successfully uploaded ${uploadedFilesMap.size} files to MinIO.`);

  // D. Read database (Redis / db.json) and replace local paths with MinIO URLs
  let db;
  let fromRedis = false;
  let redis = null;

  // Initialize Redis if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = Redis.fromEnv();
      console.log('[Database] Redis client initialized.');
    } catch (err) {
      console.warn('[Database] Failed to initialize Redis client:', err.message);
    }
  }

  if (redis) {
    try {
      console.log('[Database] Reading database from Redis (with 8s timeout)...');
      db = await withTimeout(redis.get(REDIS_DB_KEY), 8000, null);
      if (db) {
        fromRedis = true;
        console.log('[Database] Loaded from Redis.');
      } else {
        console.log('[Database] Redis read returned empty or timed out, falling back to local file.');
      }
    } catch (err) {
      console.error('[Database] Failed to read from Redis:', err.message);
    }
  }

  if (!db) {
    try {
      console.log('[Database] Reading database from local db.json...');
      const localData = await fs.readFile(DB_PATH, 'utf8');
      db = JSON.parse(localData);
      console.log('[Database] Loaded from local file.');
    } catch (err) {
      console.error('[Database] Local db.json not found:', err.message);
    }
  }

  if (db) {
    console.log('[Database] Updating image references...');

    // Function to replace URLs in a string efficiently using a single regex pattern
    const replaceUrlsInText = (text) => {
      if (!text || typeof text !== 'string') return text;
      return text.replace(/(?:\/)?uploads\/([^\/\s"'>\)]+)/g, (match, filename) => {
        return `${minioPublicUrl}/${filename}`;
      });
    };

    // Update news articles
    if (Array.isArray(db.news)) {
      for (const article of db.news) {
        if (article.image && (article.image.startsWith('/uploads/') || article.image.startsWith('uploads/'))) {
          const filename = article.image.substring(article.image.indexOf('uploads/') + 8);
          article.image = `${minioPublicUrl}/${filename}`;
        }
        if (article.content) {
          article.content = replaceUrlsInText(article.content);
        }
      }
    }

    // Update pages / pageContents
    if (Array.isArray(db.pageContents)) {
      for (const page of db.pageContents) {
        if (page.fields) {
          for (const key of Object.keys(page.fields)) {
            page.fields[key] = replaceUrlsInText(page.fields[key]);
          }
        }
      }
    }

    // Save updated db.json locally
    console.log('[Database] Saving updated database to local db.json...');
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('[Database] Saved locally.');

    // Save updated database to Redis
    if (redis) {
      try {
        console.log('[Database] Saving updated database to Redis (with 8s timeout)...');
        await withTimeout(redis.set(REDIS_DB_KEY, db), 8000, null);
        console.log('[Database] Saved to Redis successfully.');
      } catch (err) {
        console.error('[Database] Failed to write to Redis:', err.message);
      }
    }
  }

  console.log('\n--- MIGRATION COMPLETED SUCCESSFULLY ---');
}

run();
