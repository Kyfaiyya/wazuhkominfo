import { readDb, writeDb, DEFAULT_MAP_POINTS } from '../src/backend/db';

async function run() {
  console.log('Populating mapPoints in database...');
  const db = await readDb();
  
  // Explicitly assign the default map points
  db.mapPoints = DEFAULT_MAP_POINTS;
  
  await writeDb(db);
  console.log(`Successfully populated ${db.mapPoints.length} map points in database!`);
}

run().catch(console.error);
