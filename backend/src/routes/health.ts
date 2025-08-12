import { Router, Request, Response } from 'express'
import { db } from '@/utils/database'
import config from '@/utils/config'
import { ApiResponse } from '@/types'

const router = Router()

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', async (req: Request, res: Response) => {
  const healthCheck: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.NODE_ENV,
    version: config.API_VERSION,
    services: {
      api: 'healthy',
      database: 'unknown',
    },
  }

  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    healthCheck.services.database = 'healthy'
  } catch (error) {
    healthCheck.services.database = 'unhealthy'
    healthCheck.status = 'degraded'
  }

  const statusCode = healthCheck.status === 'ok' ? 200 : 503
  
  res.status(statusCode).json({
    success: healthCheck.status === 'ok',
    data: healthCheck,
  } as ApiResponse)
})

/**
 * Detailed health check for monitoring
 * GET /api/health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now()
  
  const healthCheck: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.NODE_ENV,
    version: config.API_VERSION,
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
    services: {
      api: {
        status: 'healthy',
        responseTime: 0,
      },
      database: {
        status: 'unknown',
        responseTime: 0,
      },
    },
  }

  // Test database connection with timing
  const dbStartTime = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    const dbEndTime = Date.now()
    healthCheck.services.database = {
      status: 'healthy',
      responseTime: dbEndTime - dbStartTime,
    }
  } catch (error) {
    const dbEndTime = Date.now()
    healthCheck.services.database = {
      status: 'unhealthy',
      responseTime: dbEndTime - dbStartTime,
      error: (error as Error).message,
    }
    healthCheck.status = 'degraded'
  }

  const endTime = Date.now()
  healthCheck.services.api.responseTime = endTime - startTime

  const statusCode = healthCheck.status === 'ok' ? 200 : 503
  
  res.status(statusCode).json({
    success: healthCheck.status === 'ok',
    data: healthCheck,
  } as ApiResponse)
})

/**
 * Database statistics endpoint
 * GET /api/health/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      userCount,
      postCount,
      commentCount,
      categoryCount,
      tagCount,
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.comment.count(),
      db.category.count(),
      db.tag.count(),
    ])

    const stats = {
      users: userCount,
      posts: postCount,
      comments: commentCount,
      categories: categoryCount,
      tags: tagCount,
      timestamp: new Date().toISOString(),
    }

    res.json({
      success: true,
      data: stats,
    } as ApiResponse)

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
    } as ApiResponse)
  }
})

/**
 * Readiness check for Kubernetes
 * GET /api/health/ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    
    res.json({
      success: true,
      message: 'Service is ready',
    } as ApiResponse)
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
    } as ApiResponse)
  }
})

/**
 * Liveness check for Kubernetes
 * GET /api/health/live
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service is alive',
  } as ApiResponse)
})

export default router