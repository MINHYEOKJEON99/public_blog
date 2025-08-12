import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ApiResponse, ApiError } from '@/types'
import { isDevelopment } from '@/utils/config'

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public errors?: Record<string, string[]>

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let errors: string[] | undefined

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    if (error.errors) {
      errors = Object.entries(error.errors).map(([key, msgs]) => 
        `${key}: ${msgs.join(', ')}`
      )
    }
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    const prismaError = handlePrismaError(error)
    statusCode = prismaError.statusCode
    message = prismaError.message
    errors = prismaError.errors
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Invalid data provided'
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500
    message = 'Database error occurred'
  } else if (error.name === 'ValidationError') {
    statusCode = 422
    message = 'Validation failed'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid authentication token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Authentication token expired'
  } else if (error.name === 'MulterError') {
    const multerError = handleMulterError(error as any)
    statusCode = multerError.statusCode
    message = multerError.message
  }

  // Log error in development or for server errors
  if (isDevelopment || statusCode >= 500) {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    })
  }

  // Send error response
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  }

  // Include stack trace in development
  if (isDevelopment && statusCode >= 500) {
    (response as any).stack = error.stack
  }

  res.status(statusCode).json(response)
}

/**
 * Handle Prisma database errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number
  message: string
  errors?: string[]
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = (error.meta?.target as string[]) || []
      const field = target.length > 0 ? target[0] : 'field'
      return {
        statusCode: 409,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      }

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Resource not found',
      }

    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Invalid reference provided',
      }

    case 'P2014':
      // Required relation violation
      return {
        statusCode: 400,
        message: 'Invalid data: missing required relation',
      }

    case 'P2016':
      // Query interpretation error
      return {
        statusCode: 400,
        message: 'Invalid query parameters',
      }

    case 'P2021':
      // Table does not exist
      return {
        statusCode: 500,
        message: 'Database schema error',
      }

    case 'P2022':
      // Column does not exist
      return {
        statusCode: 500,
        message: 'Database schema error',
      }

    default:
      return {
        statusCode: 500,
        message: 'Database error occurred',
      }
  }
}

/**
 * Handle Multer file upload errors
 */
function handleMulterError(error: any): {
  statusCode: number
  message: string
} {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: 413,
        message: 'File size too large',
      }

    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: 400,
        message: 'Too many files uploaded',
      }

    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: 400,
        message: 'Unexpected file field',
      }

    case 'LIMIT_FIELD_KEY':
      return {
        statusCode: 400,
        message: 'Field name too long',
      }

    case 'LIMIT_FIELD_VALUE':
      return {
        statusCode: 400,
        message: 'Field value too long',
      }

    case 'LIMIT_FIELD_COUNT':
      return {
        statusCode: 400,
        message: 'Too many fields',
      }

    case 'LIMIT_PART_COUNT':
      return {
        statusCode: 400,
        message: 'Too many parts in multipart data',
      }

    default:
      return {
        statusCode: 400,
        message: 'File upload error',
      }
  }
}

/**
 * Middleware for handling 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}

/**
 * Middleware for handling async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Create different types of common errors
 */
export const createError = {
  badRequest: (message: string = 'Bad Request') => new AppError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new AppError(message, 401),
  forbidden: (message: string = 'Forbidden') => new AppError(message, 403),
  notFound: (message: string = 'Not Found') => new AppError(message, 404),
  conflict: (message: string = 'Conflict') => new AppError(message, 409),
  unprocessableEntity: (message: string = 'Unprocessable Entity', errors?: Record<string, string[]>) => 
    new AppError(message, 422, true, errors),
  tooManyRequests: (message: string = 'Too Many Requests') => new AppError(message, 429),
  internal: (message: string = 'Internal Server Error') => new AppError(message, 500),
}