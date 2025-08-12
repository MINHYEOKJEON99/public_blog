import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ApiResponse } from '@/types'

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: z.ZodSchema<any>, target: 'body' | 'query' | 'params' | 'all' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      let dataToValidate: any
      
      if (target === 'all') {
        dataToValidate = {
          body: req.body,
          query: req.query,
          params: req.params,
        }
      } else {
        dataToValidate = req[target]
      }

      const result = schema.parse(dataToValidate)

      // Replace req properties with validated data
      if (target === 'all') {
        req.body = result.body || req.body
        req.query = result.query || req.query
        req.params = result.params || req.params
      } else {
        (req as any)[target] = result
      }

      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {}
        
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(err.message)
        })

        res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`),
        } as ApiResponse)
        return
      }

      console.error('Validation middleware error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during validation',
      } as ApiResponse)
      return
    }
  }
}

/**
 * Middleware to validate file uploads
 */
export interface FileValidationOptions {
  maxSize?: number
  allowedTypes?: string[]
  required?: boolean
  fieldName?: string
}

export const validateFile = (options: FileValidationOptions = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    required = false,
    fieldName = 'file'
  } = options

  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file || (req.files as any)?.[fieldName]

    if (!file) {
      if (required) {
        res.status(400).json({
          success: false,
          message: `${fieldName} is required`,
        } as ApiResponse)
        return
      }
      next()
      return
    }

    // Check file size
    if (file.size > maxSize) {
      res.status(400).json({
        success: false,
        message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
      } as ApiResponse)
      return
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `File type not supported. Allowed types: ${allowedTypes.join(', ')}`,
      } as ApiResponse)
      return
    }

    next()
  }
}

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page = '1', limit = '10' } = req.query as any

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)

  if (isNaN(pageNum) || pageNum < 1) {
    res.status(400).json({
      success: false,
      message: 'Page must be a positive integer',
    } as ApiResponse)
    return
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
    } as ApiResponse)
    return
  }

  req.query.page = pageNum.toString()
  req.query.limit = limitNum.toString()

  next()
}

/**
 * Middleware to sanitize input data
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim()
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key])
        }
      }
      return sanitized
    }
    
    return obj
  }

  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params)
  }

  next()
}

/**
 * Middleware to validate Content-Type for JSON requests
 */
export const validateJsonContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type']
    
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      res.status(415).json({
        success: false,
        message: 'Content-Type must be application/json or multipart/form-data',
      } as ApiResponse)
      return
    }
  }

  next()
}