import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

// Target directory for uploads
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');
const REDIS_DB_KEY = "diskominfo:database";

// Load .env.local manually
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

// Initialize Redis if configured
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = Redis.fromEnv();
    console.log('[Migration] Redis client initialized successfully.');
  } catch (err) {
    console.warn('[Migration] Failed to initialize Redis client:', err.message);
  }
}

// Global download promise cache to prevent duplicate requests
const downloadCache = new Map();

// Download utility
function downloadImage(url, customFilename = null) {
  if (!url || typeof url !== 'string') return Promise.resolve('');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return Promise.resolve(url);
  }

  if (downloadCache.has(url)) {
    return downloadCache.get(url);
  }

  const downloadPromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.mkdir(UPLOADS_DIR, { recursive: true });

      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      let ext = path.extname(pathname).toLowerCase();
      if (!ext || ext.length > 5) ext = '.jpg';

      let filename;
      if (customFilename) {
        filename = customFilename.endsWith(ext) ? customFilename : `${customFilename}${ext}`;
      } else {
        const baseName = path.basename(pathname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase();
        filename = `${Date.now()}-${baseName || 'image'}${ext}`;
      }

      const filePath = path.join(UPLOADS_DIR, filename);
      await fs.writeFile(filePath, buffer);
      // console.log(`[Success] ${url} -> /uploads/${filename}`);
      return `/uploads/${filename}`;
    } catch (error) {
      console.error(`[Error] Failed to download ${url}:`, error.message);
      return url;
    }
  })();

  downloadCache.set(url, downloadPromise);
  return downloadPromise;
}

async function downloadImagesFromHtml(html) {
  if (!html || typeof html !== 'string') return html;
  const imgRegex = /src=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  const urls = [];
  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  const uniqueUrls = [...new Set(urls)];
  let updatedHtml = html;
  for (const url of uniqueUrls) {
    const localPath = await downloadImage(url);
    if (localPath !== url) {
      const escapedUrl = url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const replaceRegex = new RegExp(escapedUrl, 'g');
      updatedHtml = updatedHtml.replace(replaceRegex, localPath);
    }
  }
  return updatedHtml;
}

// Concurrency pool helper
async function concurrentMap(array, concurrency, mapper) {
  const results = [];
  const activePromises = [];
  
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const p = (async () => {
      try {
        return await mapper(item, i);
      } catch (err) {
        console.error(`Error mapping item at index ${i}:`, err.message);
        return null;
      }
    })();
    results.push(p);
    
    const active = p.then(() => {
      activePromises.splice(activePromises.indexOf(active), 1);
    });
    activePromises.push(active);
    
    if (activePromises.length >= concurrency) {
      await Promise.race(activePromises);
    }
  }
  
  return Promise.all(results);
}

async function run() {
  console.log('--- STARTING CONCURRENT IMAGE MIGRATION ---');

  // Ensure default banner exists as local fallback
  console.log('\nDownloading default banner...');
  await downloadImage(
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2023/02/BANNER-KOMINFO.jpg',
    'banner-kominfo.jpg'
  );

  // Pre-download other static assets used in React components
  const staticUrls = [
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-24-at-20.29.37-534x462.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-18-at-16.16.15-534x462.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-15-at-07.57.40-2-534x462.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/Desain-tanpa-judul-46-534x462.jpg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-08-at-21.58.192-534x462.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-24-at-20.29.37.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-18-at-16.16.15.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-15-at-07.57.40-2.jpeg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/Desain-tanpa-judul-46.jpg',
    'https://diskominfo.penajamkab.go.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-08-at-21.58.192.jpeg'
  ];

  console.log('\nDownloading static frontend assets...');
  const staticMapping = {};
  for (const url of staticUrls) {
    const local = await downloadImage(url);
    staticMapping[url] = local;
  }

  // Load database
  let db;
  let fromRedis = false;
  if (redis) {
    try {
      console.log('\nReading from Upstash Redis...');
      db = await redis.get(REDIS_DB_KEY);
      if (db) {
        fromRedis = true;
        console.log('[Database] Loaded from Upstash Redis key.');
      }
    } catch (err) {
      console.error('[Database] Failed to read from Redis, using local file:', err.message);
    }
  }

  if (!db) {
    console.log('\nReading from local db.json...');
    const localData = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(localData);
    console.log('[Database] Loaded from local file.');
  }

  // Migrate news articles in parallel
  if (db && Array.isArray(db.news)) {
    console.log(`\nMigrating ${db.news.length} news articles with concurrency = 30...`);
    
    await concurrentMap(db.news, 30, async (article, index) => {
      if (index % 50 === 0 || index === db.news.length - 1) {
        console.log(`[Progress] Processing article ${index + 1}/${db.news.length}...`);
      }
      
      if (article.image) {
        article.image = await downloadImage(article.image);
      } else {
        article.image = '/uploads/banner-kominfo.jpg';
      }
      
      if (article.content) {
        article.content = await downloadImagesFromHtml(article.content);
      }
    });
  }

  // Write changes back to db
  console.log('\nWriting updated database to local db.json...');
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log('[Database] Saved to local file.');

  if (redis) {
    try {
      console.log('Writing updated database to Redis...');
      await redis.set(REDIS_DB_KEY, db);
      console.log('[Database] Saved to Upstash Redis key.');
    } catch (err) {
      console.error('[Database] Failed to save to Redis:', err.message);
    }
  }

  console.log(`\nTotal unique image assets downloaded: ${downloadCache.size}`);
  console.log('\n--- MIGRATION COMPLETED SUCCESSFULLY ---');
}

run();
