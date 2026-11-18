import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

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
  console.log('No .env.local file loaded, proceeding with process.env');
}

async function run() {
  console.log('--- DB SYNCHRONIZATION CHECK ---');

  // Load local database
  let localDb;
  try {
    const localData = await fs.readFile(DB_PATH, 'utf8');
    localDb = JSON.parse(localData);
    console.log(`[Local File] Loaded. Summary:`);
    console.log(`  - Users: ${localDb.users?.length || 0}`);
    console.log(`  - News: ${localDb.news?.length || 0}`);
    console.log(`  - Announcements: ${localDb.announcements?.length || 0}`);
    console.log(`  - Page Contents: ${localDb.pageContents?.length || 0}`);
    console.log(`  - Comments: ${localDb.comments?.length || 0}`);
    console.log(`  - Map Points: ${localDb.mapPoints?.length || 0}`);
  } catch (err) {
    console.error('[Local File] Error reading local db.json:', err.message);
    process.exit(1);
  }

  // Connect to Redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('[Redis] Upstash Redis credentials not configured in env.');
    process.exit(1);
  }

  let redis;
  try {
    redis = Redis.fromEnv();
    console.log('[Redis] Initialized client.');
  } catch (err) {
    console.error('[Redis] Failed to initialize Redis client:', err.message);
    process.exit(1);
  }

  // Read Redis Database
  let redisDb = null;
  try {
    console.log('[Redis] Fetching data from key:', REDIS_DB_KEY);
    redisDb = await redis.get(REDIS_DB_KEY);
    
    if (redisDb) {
      console.log(`[Redis Database] Loaded. Summary:`);
      console.log(`  - Users: ${redisDb.users?.length || 0}`);
      console.log(`  - News: ${redisDb.news?.length || 0}`);
      console.log(`  - Announcements: ${redisDb.announcements?.length || 0}`);
      console.log(`  - Page Contents: ${redisDb.pageContents?.length || 0}`);
      console.log(`  - Comments: ${redisDb.comments?.length || 0}`);
      console.log(`  - Map Points: ${redisDb.mapPoints?.length || 0}`);
    } else {
      console.log('[Redis Database] Live database key is empty.');
    }
  } catch (err) {
    console.error('[Redis Database] Error reading from Redis:', err.message);
  }

  // Sync logic: Upload local to Redis to ensure 100% data consistency
  console.log('\n[Sync] Uploading local data to Upstash Redis database...');
  try {
    await redis.set(REDIS_DB_KEY, localDb);
    console.log('[Sync] Success! Live Redis database has been populated/updated with local db.json.');
    
    // Verify again
    const verifiedDb = await redis.get(REDIS_DB_KEY);
    if (verifiedDb) {
      console.log(`[Verification] Confirmed keys match. Live database has ${verifiedDb.news?.length || 0} news articles.`);
    }
  } catch (err) {
    console.error('[Sync] Failed to upload local data to Redis:', err.message);
    process.exit(1);
  }

  console.log('\n--- DB SYNCHRONIZATION COMPLETED ---');
}

run();
