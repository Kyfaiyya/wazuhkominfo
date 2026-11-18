import fs from 'fs/promises';
import path from 'path';
import * as Minio from 'minio';

// Load env
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
} catch (e) {}

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'webkominfo';
const minioPublicUrl = (process.env.MINIO_PUBLIC_URL || `http://localhost:9000/${bucketName}`).replace(/\/$/, '');

async function main() {
  console.log('Verifying news article images in MinIO...');
  
  // 1. Get all objects in MinIO bucket
  const minioObjects = new Set();
  const stream = minioClient.listObjectsV2(bucketName, '', true);
  for await (const obj of stream) {
    minioObjects.add(obj.name.toLowerCase());
  }
  console.log(`Loaded ${minioObjects.size} objects from MinIO bucket "${bucketName}".`);

  // 2. Read local db.json
  const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');
  const rawDb = await fs.readFile(DB_PATH, 'utf8');
  const db = JSON.parse(rawDb);
  
  let validCount = 0;
  let brokenCount = 0;
  let brokenSamples = [];

  for (const article of db.news) {
    const image = article.image || '';
    if (!image) continue;

    if (image.startsWith(minioPublicUrl)) {
      const objectName = image.replace(`${minioPublicUrl}/`, '').toLowerCase();
      if (minioObjects.has(objectName)) {
        validCount++;
      } else {
        brokenCount++;
        if (brokenSamples.length < 5) {
          brokenSamples.push({ id: article.id, title: article.title, image, objectName });
        }
      }
    } else {
      brokenCount++;
      if (brokenSamples.length < 5) {
        brokenSamples.push({ id: article.id, title: article.title, image, reason: 'Not matching MinIO URL' });
      }
    }
  }

  console.log(`Verification results:`);
  console.log(`  - Total news: ${db.news.length}`);
  console.log(`  - Valid cover images: ${validCount}`);
  console.log(`  - Broken cover images: ${brokenCount}`);
  
  if (brokenSamples.length > 0) {
    console.log('Broken samples:', JSON.stringify(brokenSamples, null, 2));
  }
}

main().catch(console.error);
