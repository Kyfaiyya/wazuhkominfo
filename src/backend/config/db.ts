import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Redis } from '@upstash/redis';

// Setup Redis Client for health checks
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (error) {
  console.warn("Failed to initialize Upstash Redis:", error);
}

export async function checkRedisHealth(): Promise<{
  connected: boolean;
  configured: boolean;
  latencyMs: number | null;
  error: string | null;
}> {
  if (!redis) {
    return {
      connected: false,
      configured: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      latencyMs: null,
      error: 'Redis client not initialized. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
    };
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latencyMs = Date.now() - start;

    return {
      connected: true,
      configured: true,
      latencyMs,
      error: null,
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      latencyMs: null,
      error: (error as Error).message,
    };
  }
}


// Setup Prisma Client with pg driver adapter for Prisma 7
const globalForPrisma = global as unknown as { prisma: PrismaClient; pgPool: Pool };

const connectionString = process.env.DATABASE_URL;

if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString });
  globalForPrisma.pgPool = pool;
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
  passwordHash: string;
}

export interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  author: string;
  image: string;
  status: string;
  tags: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  type: string;
  urgent: boolean;
  desc: string;
}

export interface PageContent {
  slug: string;
  title: string;
  fields: Record<string, string>;
}

export interface Comment {
  id: string;
  newsId: string;
  userEmail: string;
  userName: string;
  content: string;
  date: string;
}

export interface MapPoint {
  id: string;
  name: string;
  category: 'wifi' | 'cctv' | 'bts';
  lat: number;
  lng: number;
  status: string;
  details: string;
  location: string;
  videoId?: string;
}

export interface ApiRequest {
  id: string;
  name: string;
  email: string;
  organization: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  apiKey?: string;
}

export async function backupToRedis(): Promise<boolean> {
  if (!redis) {
    console.warn("[Sync] Backup skipped: Redis client not initialized.");
    return false;
  }
  try {
    const users = await prisma.user.findMany();
    const news = await prisma.news.findMany();
    const announcements = await prisma.announcement.findMany();
    const pageContents = await prisma.pageContent.findMany();
    const comments = await prisma.comment.findMany();
    const mapPoints = await prisma.mapPoint.findMany();
    const apiRequests = await prisma.apiRequest.findMany();

    const dbPayload = {
      users,
      news,
      announcements,
      pageContents,
      comments,
      mapPoints,
      apiRequests
    };

    await redis.set("diskominfo:database", dbPayload);
    console.log("[Sync] Auto-backup to Upstash Redis completed successfully.");
    return true;
  } catch (error) {
    console.error("[Sync] Auto-backup to Upstash Redis failed:", error);
    return false;
  }
}
