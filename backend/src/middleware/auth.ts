import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { JWTService } from '@/utils/jwt'
import { db } from '@/utils/database'
import { AuthenticatedRequest, ApiResponse } from '@/types'

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required',
      } as ApiResponse)
      return
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = JWTService.verifyAccessToken(token)
      
      // Get user from database to ensure they still exist and are active
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          bio: true,
          avatar: true,
          role: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid authentication token',
        } as ApiResponse)
        return
      }

      req.user = user
      next()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Access token expired') {
          res.status(401).json({
            success: false,
            message: 'Authentication token expired',
          } as ApiResponse)
          return
        }
        
        if (error.message === 'Invalid access token') {
          res.status(401).json({
            success: false,
            message: 'Invalid authentication token',
          } as ApiResponse)
          return
        }
      }

      res.status(401).json({
        success: false,
        message: 'Authentication failed',
      } as ApiResponse)
      return
    }
  } catch (error) {
    console.error('Authentication middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    } as ApiResponse)
    return
  }
}

/**
 * Middleware to authorize requests based on user roles
 */
export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      } as ApiResponse)
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      } as ApiResponse)
      return
    }

    next()
  }
}

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = authorize(Role.ADMIN)

/**
 * Export authenticate as auth for consistency with route imports
 */
export const auth = authenticate

/**
 * Middleware for optional authentication (user can be null)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user
    next()
    return
  }

  const token = authHeader.substring(7)
  
  try {
    const decoded = JWTService.verifyAccessToken(token)
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (user) {
      req.user = user
    }
  } catch (error) {
    // Token invalid or expired, continue without user
    console.warn('Optional authentication failed:', error)
  }

  next()
}

/**
 * Middleware to check if user owns the resource or is admin
 */
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'authorId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      } as ApiResponse)
      return
    }

    // Admin can access any resource
    if (req.user.role === Role.ADMIN) {
      next()
      return
    }

    // Check ownership in req.body or req.params
    const resourceUserId = (req as any).resource?.[resourceUserIdField] || 
                          req.body[resourceUserIdField] ||
                          req.params.userId

    if (resourceUserId && resourceUserId === req.user.id) {
      next()
      return
    }

    res.status(403).json({
      success: false,
      message: 'You can only access your own resources',
    } as ApiResponse)
    return
  }
}

/**
 * Middleware to check email verification status
 */
export const requireVerifiedEmail = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    } as ApiResponse)
    return
  }

  if (!req.user.verified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
    } as ApiResponse)
    return
  }

  next()
}