import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import config from '@/utils/config'
import { ApiResponse } from '@/types'

/**
 * CORS configuration
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true)
    }
    
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  maxAge: 86400, // 24 hours
}

/**
 * Helmet security configuration
 */
export const helmetOptions: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}

/**
 * Compression middleware configuration
 */
export const compressionOptions: compression.CompressionOptions = {
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
}

/**
 * General rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health'
  },
})

/**
 * Strict rate limiting for sensitive endpoints
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after 15 minutes',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Auth rate limiting
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
})

/**
 * Upload rate limiting
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 uploads per minute
  message: {
    success: false,
    message: 'Too many file uploads, please try again after 1 minute',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * API rate limiting for different tiers
 */
export const createApiRateLimit = (maxRequests: number, windowMs: number = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: `API rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes`,
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      const user = (req as any).user
      return user ? `user:${user.id}` : `ip:${req.ip}`
    },
  })
}

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove server signature
  res.removeHeader('X-Powered-By')
  
  // Custom security headers
  res.setHeader('X-API-Version', config.API_VERSION)
  res.setHeader('X-Response-Time', Date.now().toString())
  
  next()
}

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./,                    // Directory traversal
    /<script/i,               // XSS attempts
    /union.*select/i,         // SQL injection
    /javascript:/i,           // JavaScript protocol
    /vbscript:/i,            // VBScript protocol
  ]
  
  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
  })
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData))
  
  if (isSuspicious) {
    console.warn('🚨 Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
    })
  }
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    
    // Log slow requests
    if (duration > 5000) {
      console.warn('🐌 Slow request:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        status: res.statusCode,
      })
    }
    
    // Log errors
    if (res.statusCode >= 400) {
      console.error('❌ Request error:', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      })
    }
  })
  
  next()
}

/**
 * IP whitelist middleware (for admin endpoints)
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip
    
    if (!allowedIPs.includes(clientIP)) {
      console.warn('🚫 Unauthorized IP access attempt:', {
        ip: clientIP,
        url: req.url,
        userAgent: req.get('User-Agent'),
      })
      
      res.status(403).json({
        success: false,
        message: 'Access denied from this IP address',
      } as ApiResponse)
      return
    }
    
    next()
  }
}

/**
 * Request size limiter
 */
export const requestSizeLimit = (maxSize: string = '1mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10)
    const maxBytes = parseSize(maxSize)
    
    if (contentLength > maxBytes) {
      res.status(413).json({
        success: false,
        message: `Request entity too large. Maximum size is ${maxSize}`,
      } as ApiResponse)
      return
    }
    
    next()
  }
}

/**
 * Parse size string to bytes
 */
function parseSize(size: string): number {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  }
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = match[2] || 'b'
  
  return Math.floor(value * (units as any)[unit])
}