import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');
const REDIS_DB_KEY = "diskominfo:database";

const url = "https://national-bluejay-42181.upstash.io";
const token = "AaTFAAIgcDFhM2U3YTE0NmQ2MzM0MDk0YjUyYzBkM2U4NjczMjhhNQ";

async function run() {
  console.log('--- SYNCING REDIS VIA DIRECT REST FETCH ---');
  try {
    const localData = await fs.readFile(DB_PATH, 'utf8');
    const localDb = JSON.parse(localData);

    console.log(`[Local Database] Loaded news articles count: ${localDb.news?.length || 0}`);

    console.log('[REST API] Sending database update to Upstash Redis REST endpoint...');
    const response = await fetch(`${url}/set/${REDIS_DB_KEY}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localDb)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const result = await response.json();
    console.log('[Success] Redis updated successfully! Result:', result);
  } catch (err) {
    console.error('[Error] Sync failed:', err.message);
    process.exit(1);
  }
}

run();
