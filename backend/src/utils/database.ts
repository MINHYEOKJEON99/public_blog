import { PrismaClient } from '@prisma/client'
import { isDevelopment } from './config'

declare global {
  var __db__: PrismaClient | undefined
}

let db: PrismaClient

if (isDevelopment) {
  // In development, use a global variable to preserve the connection across module reloads
  if (!global.__db__) {
    global.__db__ = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    })
  }
  db = global.__db__
} else {
  // In production, create a new instance
  db = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal',
  })
}

// Middleware to soft delete (if needed)
db.$use(async (params, next) => {
  // Add global middleware here if needed
  return next(params)
})

export { db }

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...')
  await db.$disconnect()
})