import fs from 'fs/promises';
import fsSync from 'fs';
import readline from 'readline';
import path from 'path';

const SQL_PATH = path.join(process.cwd(), 'diskominfo2019_567 (1).sql');
const DB_PATH = path.join(process.cwd(), 'src', 'backend', 'db.json');

// Parse a single SQL row line like (1, 2, 'hello', 'world'), or (1, 2, 'hello', 'world');
function parseSqlRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('(')) return null;
  
  let dataStr = trimmed;
  if (trimmed.endsWith('),') || trimmed.endsWith(');')) {
    dataStr = trimmed.substring(1, trimmed.length - 2);
  } else if (trimmed.endsWith(')')) {
    dataStr = trimmed.substring(1, trimmed.length - 1);
  } else {
    dataStr = trimmed.substring(1);
  }
  
  const cells = [];
  let currentWord = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < dataStr.length; i++) {
    const char = dataStr[i];
    
    if (inString) {
      if (char === '\\') {
        i++;
        if (i < dataStr.length) {
          const nextChar = dataStr[i];
          if (nextChar === 'n') currentWord += '\n';
          else if (nextChar === 'r') currentWord += '\r';
          else if (nextChar === 't') currentWord += '\t';
          else currentWord += nextChar;
        }
      } else if (char === stringChar) {
        inString = false;
      } else {
        currentWord += char;
      }
    } else {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === ',') {
        cells.push(currentWord.trim());
        currentWord = '';
      } else {
        currentWord += char;
      }
    }
  }
  cells.push(currentWord.trim());
  return cells;
}

const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatWpDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') {
    // Return current date in Indonesian format if date is invalid
    const date = new Date();
    return `${date.getDate()} ${INDO_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
  const parts = dateStr.split(' ');
  const dateParts = parts[0].split('-');
  if (dateParts.length < 3) return dateStr;
  
  const year = dateParts[0];
  const monthIdx = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  
  const monthName = INDO_MONTHS[monthIdx] || 'Januari';
  return `${day} ${monthName} ${year}`;
}

async function main() {
  console.log('--- WP SQL DUMP TO POSTGRESQL MIGRATION ---');

  // Read existing db.json first
  let db = { news: [], users: [], pageContents: [], announcements: [], comments: [], mapPoints: [], apiRequests: [] };
  try {
    const rawDb = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(rawDb);
    console.log('[Backup] Loaded existing db.json. Preserving other tables.');
  } catch (e) {
    console.warn('[Backup] No existing db.json found. Creating new backup structure.');
  }

  const fileStream = fsSync.createReadStream(SQL_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Intermediate data stores
  const terms = new Map(); // term_id -> name
  const termTaxonomy = new Map(); // term_taxonomy_id -> { termId, taxonomy }
  const termRelationships = new Map(); // object_id -> Array of term_taxonomy_id
  const postmeta = new Map(); // post_id -> Map of meta_key -> meta_value
  const attachments = new Map(); // attachment_id -> url/guid
  const rawPosts = []; // array of raw post rows

  let currentSection = '';

  console.log('[Parsing] Reading SQL dump file (streaming)...');

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section
    if (trimmed.startsWith('INSERT INTO `wpty_terms`')) {
      currentSection = 'terms';
      continue;
    } else if (trimmed.startsWith('INSERT INTO `wpty_term_taxonomy`')) {
      currentSection = 'taxonomy';
      continue;
    } else if (trimmed.startsWith('INSERT INTO `wpty_term_relationships`')) {
      currentSection = 'relationships';
      continue;
    } else if (trimmed.startsWith('INSERT INTO `wpty_postmeta`')) {
      currentSection = 'postmeta';
      continue;
    } else if (trimmed.startsWith('INSERT INTO `wpty_posts`')) {
      currentSection = 'posts';
      continue;
    } else if (trimmed.startsWith('UNLOCK TABLES') || (trimmed.startsWith('INSERT INTO') && !trimmed.startsWith('INSERT INTO `wpty_'))) {
      currentSection = '';
    }

    // Process row
    if (trimmed.startsWith('(')) {
      const row = parseSqlRow(trimmed);
      if (!row) continue;

      if (currentSection === 'terms') {
        // ID, name, slug
        terms.set(row[0], row[1]);
      } else if (currentSection === 'taxonomy') {
        // term_taxonomy_id, term_id, taxonomy
        termTaxonomy.set(row[0], { termId: row[1], taxonomy: row[2] });
      } else if (currentSection === 'relationships') {
        // object_id, term_taxonomy_id
        const objId = row[0];
        const taxId = row[1];
        if (!termRelationships.has(objId)) {
          termRelationships.set(objId, []);
        }
        termRelationships.get(objId).push(taxId);
      } else if (currentSection === 'postmeta') {
        // meta_id, post_id, meta_key, meta_value
        const postId = row[1];
        const key = row[2];
        const val = row[3];
        if (!postmeta.has(postId)) {
          postmeta.set(postId, new Map());
        }
        postmeta.get(postId).set(key, val);
      } else if (currentSection === 'posts') {
        const type = row[20];
        if (type === 'attachment') {
          // Store attachment ID and its guid url
          attachments.set(row[0], row[18]);
        } else if (type === 'post') {
          rawPosts.push(row);
        }
      }
    }
  }

  console.log('[Parsing] Done! Intermediate stats:');
  console.log(`  - Terms: ${terms.size}`);
  console.log(`  - Term Taxonomy: ${termTaxonomy.size}`);
  console.log(`  - Term Relationships: ${termRelationships.size}`);
  console.log(`  - Postmeta: ${postmeta.size}`);
  console.log(`  - Attachments: ${attachments.size}`);
  console.log(`  - Raw Posts: ${rawPosts.length}`);

  // Transform posts to match News schema
  console.log('[Transforming] Mapping WordPress posts to portal News schema...');

  const migratedNews = [];

  for (const post of rawPosts) {
    const id = post[0];
    const date = post[2];
    const content = post[4];
    const title = post[5];
    const excerpt = post[6];
    const status = post[7]; // 'publish' or 'private' or 'draft'

    // Skip revisions/trash etc. (though we already filtered by post_type === 'post')
    if (status === 'trash' || status === 'auto-draft' || status === 'inherit') continue;

    // 1. Resolve Category and Tags
    let category = 'BERITA TERKINI';
    const tagsList = [];
    const rels = termRelationships.get(id) || [];

    for (const taxId of rels) {
      const tax = termTaxonomy.get(taxId);
      if (tax) {
        const termName = terms.get(tax.termId);
        if (termName) {
          if (tax.taxonomy === 'category') {
            category = termName.toUpperCase();
          } else if (tax.taxonomy === 'post_tag') {
            tagsList.push(termName.toUpperCase());
          }
        }
      }
    }

    // 2. Resolve Featured Image URL
    let image = '';
    const meta = postmeta.get(id);
    if (meta && meta.has('_thumbnail_id')) {
      const thumbId = meta.get('_thumbnail_id');
      const attachUrl = attachments.get(thumbId);
      if (attachUrl) {
        image = attachUrl;
        // Clean URL params if any
        if (image.includes('?')) {
          image = image.split('?')[0];
        }
        // If image URL is local/relative public wp uploads path
        if (image.includes('/wp-content/uploads/')) {
          // Translate to local /uploads/ format so the image migrator can download it
          const parts = image.split('/wp-content/uploads/');
          image = '/uploads/' + parts[1];
        }
      }
    }

    // If no featured image meta, search content for first <img> tag
    if (!image && content) {
      const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match) {
        image = match[1];
        if (image.includes('/wp-content/uploads/')) {
          const parts = image.split('/wp-content/uploads/');
          image = '/uploads/' + parts[1];
        }
      }
    }

    // Default fallback image if nothing resolved
    if (!image) {
      image = '/uploads/banner-kominfo.jpg';
    }

    // 3. Resolve Excerpt
    let finalExcerpt = excerpt;
    if (!finalExcerpt && content) {
      // Strip HTML tags for clean plain text excerpt
      const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      finalExcerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }

    // 4. Map Status
    // Prisma news model status: 'published' | 'draft'
    const finalStatus = status === 'publish' ? 'published' : 'draft';

    migratedNews.push({
      id,
      title,
      excerpt: finalExcerpt || '',
      content: content || '',
      date: formatWpDate(date),
      category: category || 'BERITA TERKINI',
      author: 'Humas Diskominfo',
      image,
      status: finalStatus,
      tags: tagsList.join(','),
      updatedAt: formatWpDate(post[14]) // post_modified
    });
  }

  console.log(`[Transforming] Completed. Total mapped articles: ${migratedNews.length}`);

  // Replace and write to db.json
  db.news = migratedNews;
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log(`[Success] Saved ${migratedNews.length} migrated articles to local db.json backup.`);
}

main().catch(console.error);
