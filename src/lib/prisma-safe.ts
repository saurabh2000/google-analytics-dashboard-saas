import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a safe Prisma client that handles connection issues
export const prismaSafe = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://saurabkshaah@localhost:5432/analytics_db'
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaSafe

// Test connection on initialization
if (typeof window === 'undefined') {
  prismaSafe.$connect().catch((e) => {
    console.warn('Prisma connection warning:', e.message)
    // Don't throw - let individual queries handle connection errors
  })
}