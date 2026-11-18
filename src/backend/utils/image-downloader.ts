import path from 'path';
import { uploadToMinio } from '../config/minio';

/**
 * Downloads a single remote image and saves it in MinIO.
 * Returns the public URL of the uploaded image.
 */
export async function downloadImage(url: string): Promise<string> {
  if (!url || typeof url !== 'string') return '';
  
  // If it's already a local path, data URL, or not a remote link, return it as-is
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.statusText} (${res.status})`);
    }
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    // Deduce file name
    const urlObj = new URL(url);
    const filename = path.basename(urlObj.pathname) || 'image.jpg';

    // Upload directly to MinIO
    const fileUrl = await uploadToMinio(buffer, filename, contentType);

    console.log(`[ImageDownloader] Downloaded and uploaded ${url} -> ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error(`[ImageDownloader] Error downloading ${url}:`, error);
    return url; // Fallback to original URL so content doesn't break
  }
}

/**
 * Parse an HTML string, find all img tags with remote URLs, download them,
 * and replace their src attribute values with the downloaded local paths.
 */
export async function downloadImagesFromHtml(html: string): Promise<string> {
  if (!html || typeof html !== 'string') return html;

  // Regular expression to find all src="http..." or src='http...'
  const imgRegex = /src=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  const urlsToDownload: string[] = [];

  while ((match = imgRegex.exec(html)) !== null) {
    urlsToDownload.push(match[1]);
  }

  // Deduplicate URLs
  const uniqueUrls = Array.from(new Set(urlsToDownload));
  let updatedHtml = html;

  // Sequentially download and replace
  for (const url of uniqueUrls) {
    // Avoid double-downloading if we already processed it
    const localPath = await downloadImage(url);
    if (localPath !== url) {
      // Escape URL for use in RegExp
      const escapedUrl = url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Match both escaped and regular occurrences in JSON/HTML context
      const replaceRegex = new RegExp(escapedUrl, 'g');
      updatedHtml = updatedHtml.replace(replaceRegex, localPath);
    }
  }

  return updatedHtml;
}
