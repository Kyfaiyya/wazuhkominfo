import * as Minio from 'minio';
import fs from 'fs/promises';
import path from 'path';

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
} catch (e) {}

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'webkominfo';

async function main() {
  console.log('Checking MinIO state...');
  const exists = await minioClient.bucketExists(bucketName);
  console.log(`Bucket "${bucketName}" exists:`, exists);
  if (!exists) return;

  // Check bucket policy
  try {
    const policy = await minioClient.getBucketPolicy(bucketName);
    console.log('Bucket policy:', policy);
  } catch (e) {
    console.log('Error getting bucket policy:', e.message);
  }

  // List first 5 objects
  console.log('Listing sample objects inside MinIO:');
  const stream = minioClient.listObjectsV2(bucketName, '', true);
  let count = 0;
  for await (const obj of stream) {
    count++;
    if (count <= 5) {
      console.log(`  - Object #${count}: name="${obj.name}", size=${obj.size} bytes`);
    }
  }
  console.log('Total objects listed in bucket:', count);
}

main().catch(console.error);
