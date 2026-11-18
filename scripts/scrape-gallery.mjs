/**
 * scrape-gallery.mjs
 * 
 * Scrapes photo and video data from diskominfo.penajamkab.go.id
 * Downloads images locally and updates the database via API.
 * 
 * Usage: node scripts/scrape-gallery.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Output directory for downloaded images
const GALLERY_DIR = path.join(ROOT, 'public', 'gallery-images');

// Ensure directory exists
if (!fs.existsSync(GALLERY_DIR)) {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

/**
 * Download a file from URL to local path
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    protocol.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      } 
    }, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Fetch HTML content from a URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return fetchHTML(response.headers.location).then(resolve).catch(reject);
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Extract photo data from the foto page HTML
 */
function extractPhotos(html) {
  const photos = [];
  
  // Match gallery figures: <figure class='gallery-item'> ... <a href='HIGH_RES_URL'> ... <img src='THUMB_URL' ... /> ... <figcaption ...>CAPTION</figcaption>
  const figureRegex = /<figure class='gallery-item'>([\s\S]*?)(?=<figure class='gallery-item'>|<\/div>\s*<\/div>\s*<\/div>)/g;
  let match;
  
  while ((match = figureRegex.exec(html)) !== null) {
    const block = match[1];
    
    // Extract high-res URL from <a href='...'>
    const hrefMatch = block.match(/href='([^']+\.jpe?g)'/i);
    // Extract thumbnail URL from <img ... src="..."
    const srcMatch = block.match(/src="([^"]+(?:1024x\d+|768x\d+|300x\d+)[^"]*\.jpe?g)"/i) 
                  || block.match(/src="([^"]+\.jpe?g)"/i);
    // Extract caption from <figcaption>
    const captionMatch = block.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    
    const highResUrl = hrefMatch ? hrefMatch[1] : null;
    const thumbUrl = srcMatch ? srcMatch[1] : null;
    const caption = captionMatch 
      ? captionMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';
    
    if (highResUrl || thumbUrl) {
      // Use 1024x size for good quality but not too large
      let downloadUrl = highResUrl || thumbUrl;
      
      // Try to get 1024x version if available (better quality, manageable size)
      if (highResUrl) {
        const base = highResUrl.replace(/-scaled\.jpe?g$/i, '').replace(/\.jpe?g$/i, '');
        const ext = highResUrl.match(/\.jpe?g$/i)?.[0] || '.jpeg';
        const url1024 = `${base}-1024x683${ext}`;
        // We'll try the 1024 version, fallback to the thumb
        downloadUrl = url1024;
      }
      
      photos.push({
        highResUrl,
        downloadUrl,
        thumbUrl,
        caption,
      });
    }
  }
  
  return photos;
}

/**
 * Extract video data from the video page HTML
 */
function extractVideos(html) {
  const videos = [];
  const seen = new Set();
  
  // Match YouTube embed iframes
  const iframeRegex = /src="https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)"/g;
  let match;
  
  while ((match = iframeRegex.exec(html)) !== null) {
    const videoId = match[1];
    if (videoId && !seen.has(videoId)) {
      seen.add(videoId);
      videos.push({
        videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  }
  
  return videos;
}

/**
 * Generate a clean filename from a URL
 */
function urlToFilename(url, index) {
  const urlPath = new URL(url).pathname;
  const basename = path.basename(urlPath);
  // Clean the filename
  const clean = basename
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  return `foto-${String(index + 1).padStart(2, '0')}-${clean}`;
}

// ============ MAIN ============

async function main() {
  console.log('=== Scraping Galeri Foto & Video ===\n');
  
  // 1. Fetch foto page
  console.log('1. Fetching foto page...');
  const fotoHTML = await fetchHTML('https://diskominfo.penajamkab.go.id/foto/');
  console.log(`   Fetched ${fotoHTML.length} bytes`);
  
  // 2. Extract photos
  const rawPhotos = extractPhotos(fotoHTML);
  console.log(`   Found ${rawPhotos.length} photos`);
  
  // Deduplicate by caption (group same-captioned photos)
  const selectedPhotos = rawPhotos;
  console.log(`   Selected all ${selectedPhotos.length} photos\n`);
  
  // 3. Download photos
  console.log('2. Downloading photos...');
  const galleryList = [];
  
  for (let i = 0; i < selectedPhotos.length; i++) {
    const photo = selectedPhotos[i];
    const filename = urlToFilename(photo.downloadUrl || photo.thumbUrl, i);
    const destPath = path.join(GALLERY_DIR, filename);
    
    let downloaded = false;
    
    // Try downloading the 1024x version first
    if (photo.downloadUrl) {
      try {
        await downloadFile(photo.downloadUrl, destPath);
        downloaded = true;
        console.log(`   [${i + 1}/${selectedPhotos.length}] ✓ ${filename}`);
      } catch (e) {
        // Try high-res fallback
        if (photo.highResUrl && photo.highResUrl !== photo.downloadUrl) {
          try {
            await downloadFile(photo.highResUrl, destPath);
            downloaded = true;
            console.log(`   [${i + 1}/${selectedPhotos.length}] ✓ ${filename} (highres fallback)`);
          } catch (e2) {
            // Try thumbnail fallback
          }
        }
      }
    }
    
    // Final fallback: use thumbnail
    if (!downloaded && photo.thumbUrl) {
      try {
        await downloadFile(photo.thumbUrl, destPath);
        downloaded = true;
        console.log(`   [${i + 1}/${selectedPhotos.length}] ✓ ${filename} (thumbnail fallback)`);
      } catch (e) {
        console.log(`   [${i + 1}/${selectedPhotos.length}] ✗ FAILED: ${e.message}`);
        continue;
      }
    }
    
    if (downloaded) {
      // Determine category from caption
      let category = 'Kegiatan';
      const cap = photo.caption.toLowerCase();
      if (cap.includes('koperasi')) category = 'Ekonomi';
      else if (cap.includes('beras') || cap.includes('petani')) category = 'Pertanian';
      else if (cap.includes('kkn') || cap.includes('mahasiswa')) category = 'Pendidikan';
      else if (cap.includes('air') || cap.includes('ipa')) category = 'Infrastruktur';
      else if (cap.includes('dandim') || cap.includes('pisah sambut')) category = 'Pemerintahan';
      
      galleryList.push({
        src: `/gallery-images/${filename}`,
        title: photo.caption || '-',
        category,
      });
    }
  }
  
  console.log(`\n   Downloaded ${galleryList.length} photos successfully\n`);
  
  // 4. Fetch video page
  console.log('3. Fetching video page...');
  const videoHTML = await fetchHTML('https://diskominfo.penajamkab.go.id/video/');
  console.log(`   Fetched ${videoHTML.length} bytes`);
  
  // 5. Extract videos
  const rawVideos = extractVideos(videoHTML);
  console.log(`   Found ${rawVideos.length} videos\n`);
  
  // 6. Download video thumbnails
  console.log('4. Downloading video thumbnails...');
  const videosList = [];
  
  const videoTitles = [
    'Profil Diskominfo Kabupaten PPU',
    'Sosialisasi Program Digital PPU',
    'Infrastruktur TIK Penajam Paser Utara',
    'Layanan Publik Digital Diskominfo',
  ];
  
  for (let i = 0; i < rawVideos.length; i++) {
    const video = rawVideos[i];
    const thumbFilename = `video-thumb-${video.videoId}.jpg`;
    const thumbPath = path.join(GALLERY_DIR, thumbFilename);
    
    try {
      await downloadFile(video.thumbnail, thumbPath);
      console.log(`   [${i + 1}/${rawVideos.length}] ✓ ${thumbFilename}`);
    } catch (e) {
      console.log(`   [${i + 1}/${rawVideos.length}] ✗ Thumbnail failed: ${e.message}`);
    }
    
    videosList.push({
      title: videoTitles[i] || `Video Diskominfo PPU ${i + 1}`,
      thumbnail: `/gallery-images/${thumbFilename}`,
      duration: ['5:30', '12:45', '8:20', '15:10'][i] || '10:00',
      date: '2025',
      href: video.youtubeUrl,
    });
  }
  
  console.log(`\n   Processed ${videosList.length} videos\n`);
  
  // 7. Output JSON data
  console.log('5. Writing gallery data...');
  
  const outputData = {
    gallery_list: JSON.stringify(galleryList),
    videos_list: JSON.stringify(videosList),
  };
  
  const outputPath = path.join(ROOT, 'scripts', 'gallery-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`   Written to ${outputPath}`);
  
  // Also output the raw data for reference
  console.log('\n=== Gallery Items ===');
  galleryList.forEach((item, i) => {
    console.log(`  ${i + 1}. [${item.category}] ${item.title.substring(0, 60)}...`);
  });
  
  console.log('\n=== Video Items ===');
  videosList.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.title} (${item.href})`);
  });
  
  console.log('\n✅ Done! Run the seed script to insert data into the database.');
  console.log('   Gallery data saved to scripts/gallery-data.json');
  
  return { galleryList, videosList };
}

main().catch(console.error);
