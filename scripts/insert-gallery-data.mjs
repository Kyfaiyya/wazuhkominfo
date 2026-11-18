/**
 * insert-gallery-data.mjs
 * 
 * Reads gallery-data.json and updates the PageContent entries
 * for slugs 'gallery' and 'videos' in the database.
 * 
 * Usage: node scripts/insert-gallery-data.mjs
 * (Run inside Docker container or with DATABASE_URL set)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'gallery-data.json');
if (!fs.existsSync(dataPath)) {
  console.error('gallery-data.json not found. Run scrape-gallery.mjs first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Now update db.json with this data
const dbJsonPath = path.join(__dirname, '..', 'src', 'backend', 'db.json');
const db = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

// Find and update the gallery page
const galleryPage = db.pageContents.find(p => p.slug === 'gallery');
if (galleryPage) {
  galleryPage.fields.gallery_list = data.gallery_list;
  console.log(`Updated gallery page with ${JSON.parse(data.gallery_list).length} photos`);
} else {
  console.log('Gallery page not found in db.json, adding it');
  db.pageContents.push({
    slug: 'gallery',
    title: 'Galeri Foto',
    fields: { gallery_list: data.gallery_list }
  });
}

// Find and update the videos page
const videosPage = db.pageContents.find(p => p.slug === 'videos');
if (videosPage) {
  videosPage.fields.videos_list = data.videos_list;
  console.log(`Updated videos page with ${JSON.parse(data.videos_list).length} videos`);
} else {
  console.log('Videos page not found in db.json, adding it');
  db.pageContents.push({
    slug: 'videos',
    title: 'Galeri Video',
    fields: { videos_list: data.videos_list }
  });
}

fs.writeFileSync(dbJsonPath, JSON.stringify(db, null, 2));
console.log('✅ db.json updated successfully!');
console.log('\nNext: Run the seed script to push to PostgreSQL:');
console.log('  docker compose exec web npx prisma db seed');
