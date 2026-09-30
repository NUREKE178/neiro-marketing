// Database client - for demo uses mock, for prod uses Prisma + PostgreSQL
// This file shows production-ready architecture

let prisma: any = null

export async function getPrisma() {
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client')
      if (!prisma) {
        prisma = new PrismaClient()
      }
      return prisma
    } catch (e) {
      console.warn('Prisma not available, using mock mode', e)
      return null
    }
  }
  return null
}

// Mock Redis for caching
export const redis = {
  async get(key: string) { return null },
  async set(key: string, value: any, opts?: any) { return 'OK' },
  async del(key: string) { return 1 },
}

// Rate limiting
export async function checkRateLimit(identifier: string, limit = 100, windowSec = 3600) {
  // In production: use Redis INCR + EXPIRE
  return { allowed: true, remaining: limit - 1, limit }
}

// Background jobs mock
export async function enqueueJob(type: string, payload: any) {
  console.log(`[Job] Enqueue ${type}`, payload)
  // In production: BullMQ / Upstash QStash
  return { jobId: 'mock-' + Date.now() }
}
