import * as Minio from 'minio';
import fs from 'fs/promises';
import path from 'path';

// Configure MinIO client from env variables
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'webkominfo';

let bucketInitialized = false;

/**
 * Initializes the MinIO bucket and applies a public read-only policy
 * so uploaded assets can be directly fetched by browsers.
 */
async function initBucket() {
  if (bucketInitialized) return;

  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`[MinIO] Bucket "${bucketName}" does not exist. Creating...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
    
    // Always enforce public read-only policy for bucket files
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
    console.log(`[MinIO] Bucket "${bucketName}" initialized with public read-only access.`);
    bucketInitialized = true;
  } catch (error) {
    console.warn('[MinIO] Failed to initialize bucket (MinIO might be offline):', (error as any).message || error);
    // Do not throw, allow fallback on upload attempt
  }
}

/**
 * Uploads a file buffer to MinIO bucket and returns its public URL.
 * Falls back to local filesystem storage if MinIO is offline.
 */
export async function uploadToMinio(buffer: Buffer, originalFilename: string, contentType: string): Promise<string> {
  // Ensure bucket is initialized and configured if possible
  await initBucket();

  // Deduce safe file name
  const safeBaseName = originalFilename
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .toLowerCase();
  
  const objectName = `${Date.now()}-${safeBaseName}`;

  if (bucketInitialized) {
    try {
      console.log(`[MinIO] Uploading object "${objectName}" (${buffer.length} bytes, content-type: ${contentType})...`);

      // Upload object to bucket
      await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
        'Content-Type': contentType,
      });

      // Construct public URL
      const publicUrlBase = process.env.MINIO_PUBLIC_URL || `http://localhost:9000/${bucketName}`;
      const fileUrl = `${publicUrlBase.replace(/\/$/, '')}/${objectName}`;

      console.log(`[MinIO] Upload successful. Public URL: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('[MinIO] Upload failed, falling back to local file storage:', error);
    }
  }

  // Fallback to local storage (e.g. running without Docker)
  console.log(`[Local Storage] Saving object "${objectName}" (${buffer.length} bytes, content-type: ${contentType}) locally...`);
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, objectName), buffer);

    const fileUrl = `/uploads/${objectName}`;
    console.log(`[Local Storage] Save successful. Public URL: ${fileUrl}`);
    return fileUrl;
  } catch (localError) {
    console.error('[Local Storage] Failed to save file locally:', localError);
    throw new Error('Gagal mengunggah file (baik MinIO maupun Penyimpanan Lokal tidak tersedia)');
  }
}

// Eagerly initialize the bucket on startup (only if not in Next.js build phase)
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  initBucket().catch((err) => {
    // Only warn in development to keep logs clean
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[MinIO] Eager bucket initialization failed (MinIO might be offline):', err.message);
    }
  });
}

