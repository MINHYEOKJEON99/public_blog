import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import path from 'path'
import { db } from '@/utils/database'
import config from '@/utils/config'
import { isDevelopment } from '@/utils/config'

// Middleware imports
import { 
  corsOptions, 
  helmetOptions, 
  compressionOptions,
  generalRateLimit,
  securityHeaders,
  securityLogger,
} from '@/middleware/security'
import { errorHandler, notFoundHandler } from '@/middleware/error'

// Route imports
import authRoutes from '@/routes/auth'
import userRoutes from '@/routes/users'
import postRoutes from '@/routes/posts'
import commentRoutes from '@/routes/comments'
import categoryRoutes from '@/routes/categories'
import tagRoutes from '@/routes/tags'
import uploadRoutes from '@/routes/upload'
import healthRoutes from '@/routes/health'
import adminRoutes from '@/routes/admin'

// Services
import { AuthService } from '@/services/auth'

const app = express()
const server = createServer(app)

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1)

// Basic middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Security middleware
app.use(helmet(helmetOptions))
app.use(cors(corsOptions))
app.use(compression(compressionOptions))
app.use(securityHeaders)

// Rate limiting
app.use(generalRateLimit)

// Logging middleware
if (isDevelopment) {
  app.use(morgan('combined'))
}
app.use(securityLogger)

// Static file serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check endpoint (before rate limiting)
app.use('/api/health', healthRoutes)

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Public Blog API',
    version: config.API_VERSION,
    description: 'RESTful API for Public Blog platform',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/comments',
      categories: '/api/categories',
      tags: '/api/tags',
      upload: '/api/upload',
      admin: '/api/admin',
      health: '/api/health',
    },
  })
})

// Catch 404 and forward to error handler
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Database connection and server startup
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await db.$connect()
    console.log('✅ Database connected successfully')

    // Run cleanup tasks in development
    if (isDevelopment) {
      console.log('🧹 Running cleanup tasks...')
      await AuthService.cleanupExpiredTokens()
    }

    // Start HTTP server
    const port = config.PORT || 3001
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.log(`📖 API documentation: http://localhost:${port}/api`)
      console.log(`🏥 Health check: http://localhost:${port}/api/health`)
      
      if (isDevelopment) {
        console.log(`🌍 Environment: ${config.NODE_ENV}`)
        console.log(`📁 Upload directory: ${config.UPLOAD_DIR}`)
        console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`)
      }
    })

    // Graceful shutdown handling
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)

  server.close(async () => {
    console.log('📊 HTTP server closed')
    
    try {
      await db.$disconnect()
      console.log('🗄️  Database disconnected')
    } catch (error) {
      console.error('❌ Error disconnecting database:', error)
    }
    
    console.log('✅ Graceful shutdown completed')
    process.exit(0)
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after 10 seconds')
    process.exit(1)
  }, 10000)
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer()

export default app