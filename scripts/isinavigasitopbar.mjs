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
  console.log('--- SEEDING HEADER TOP BAR CONFIGURATION ---');

  // 1. Load local database
  let db;
  try {
    const localData = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(localData);
  } catch (err) {
    console.error('Error reading local db.json:', err.message);
    process.exit(1);
  }

  // Ensure pageContents array exists
  db.pageContents = db.pageContents || [];

  // 2. Check if header-topbar already exists
  const existingIndex = db.pageContents.findIndex(p => p.slug === 'header-topbar');
  const topBarConfig = {
    slug: 'header-topbar',
    title: 'Header Top Bar',
    fields: {
      location: '📍 Kab. Penajam Paser Utara, Kalimantan Timur',
      weather_label: '🌤️ 26°C Penajam',
      show_live_weather: 'true'
    }
  };

  if (existingIndex !== -1) {
    console.log('[Seeder] Header Top Bar config already exists. Updating fields...');
    db.pageContents[existingIndex] = topBarConfig;
  } else {
    console.log('[Seeder] Adding new Header Top Bar config...');
    db.pageContents.push(topBarConfig);
  }

  // 3. Save local fallback db.json
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('[Seeder] Local db.json successfully updated.');
  } catch (err) {
    console.error('[Seeder] Failed to save local db.json:', err.message);
    process.exit(1);
  }

  // 4. Connect and Sync to Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = Redis.fromEnv();
      console.log('[Redis] Initialized client.');
      await redis.set(REDIS_DB_KEY, db);
      console.log('[Redis] Success! Live Redis database has been updated with the top-bar config.');
    } catch (err) {
      console.error('[Redis] Failed to upload updated data:', err.message);
    }
  } else {
    console.log('[Redis] Upstash Redis credentials not configured. Local fallback only.');
  }

  console.log('--- SEEDING COMPLETED ---');
}

run();
