import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'diskominfo-ppu-fallback-super-secret-key-12345';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(JWT_SECRET).digest();
const IV_LENGTH = 12;

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export interface SessionPayload {
  id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'user';
  exp: number;
}

export function encryptSession(payload: SessionPayload): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decryptSession(sessionToken: string): SessionPayload | null {
  try {
    const buffer = Buffer.from(sessionToken, 'base64url');
    if (buffer.length < IV_LENGTH + 16) return null;

    const iv = buffer.subarray(0, IV_LENGTH);
    const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = buffer.subarray(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = decipher.update(encrypted) + decipher.final('utf8');
    const payload = JSON.parse(decrypted) as SessionPayload;

    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

// Enforce API key authentication for public endpoints
export async function validateApiKey(request: Request): Promise<boolean> {
  try {
    const url = new URL(request.url);
    
    // 1. Allow same-origin requests (requests originating from our own frontend pages)
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    const secFetchSite = request.headers.get('sec-fetch-site');
    
    if (secFetchSite === 'same-origin' || (referer && host && referer.includes(host))) {
      return true;
    }

    // 2. Allow active admin session cookies (for easy API testing in browser by admins)
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/session=([^;]+)/);
    if (match) {
      const token = match[1];
      const payload = decryptSession(token);
      if (payload && (payload.role === 'admin' || payload.role === 'superadmin')) {
        return true;
      }
    }

    // 3. Extract API Key (either search query '?api_key=...' or header 'Authorization: Bearer ...')
    let apiKey = url.searchParams.get('api_key') || '';
    if (!apiKey) {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7);
      }
    }

    if (!apiKey) return false;

    // 4. Match API key with approved requests in the database using Prisma
    const { prisma } = await import('../config/db');
    const matchedRequest = await prisma.apiRequest.findFirst({
      where: {
        status: 'approved',
        apiKey: apiKey,
      },
    });
    
    return !!matchedRequest;
  } catch {
    return false;
  }
}
