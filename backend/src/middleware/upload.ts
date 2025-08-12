import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import config from '@/utils/config'
import { AppError } from './error'

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.UPLOAD_DIR)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Create subdirectories
const createSubDirs = () => {
  const dirs = ['avatars', 'posts', 'covers']
  dirs.forEach(dir => {
    const dirPath = path.join(uploadDir, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  })
}

createSubDirs()

/**
 * Storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'posts' // default
    
    if (req.route?.path.includes('avatar')) {
      subDir = 'avatars'
    } else if (req.route?.path.includes('cover')) {
      subDir = 'covers'
    } else if (req.route?.path.includes('image')) {
      subDir = 'posts'
    }
    
    const destinationPath = path.join(uploadDir, subDir)
    cb(null, destinationPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, extension)
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
    
    cb(null, `${sanitizedBaseName}_${uniqueSuffix}${extension}`)
  },
})

/**
 * File filter function
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = config.ALLOWED_FILE_TYPES.split(',').map(type => type.trim())
  const fileExtension = path.extname(file.originalname).substring(1).toLowerCase()
  
  // Check file extension
  if (!allowedTypes.includes(fileExtension)) {
    return cb(new AppError(
      `File type not supported. Allowed types: ${allowedTypes.join(', ')}`, 
      400
    ))
  }
  
  // Check MIME type for additional security
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
  ]
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError(
      'Invalid file format. Only image files are allowed',
      400
    ))
  }
  
  cb(null, true)
}

/**
 * Base upload configuration
 */
const baseUploadConfig: multer.Options = {
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1, // Single file by default
  },
}

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName: string = 'file') => {
  return multer({
    ...baseUploadConfig,
  }).single(fieldName)
}

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
  return multer({
    ...baseUploadConfig,
    limits: {
      ...baseUploadConfig.limits,
      files: maxCount,
    },
  }).array(fieldName, maxCount)
}

/**
 * Avatar upload middleware
 */
export const uploadAvatar = multer({
  ...baseUploadConfig,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // More restrictive for avatars
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new AppError(
        'Avatar must be a JPEG, PNG, or WebP image',
        400
      ))
    }
    
    cb(null, true)
  },
}).single('avatar')

/**
 * Post image upload middleware
 */
export const uploadPostImage = multer({
  ...baseUploadConfig,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1,
  },
}).single('image')

/**
 * Cover image upload middleware
 */
export const uploadCoverImage = multer({
  ...baseUploadConfig,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for cover images
    files: 1,
  },
}).single('cover')

/**
 * Get file URL helper
 */
export const getFileUrl = (filename: string, subDir: string = 'posts'): string => {
  return `/uploads/${subDir}/${filename}`
}

/**
 * Delete file helper
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), 'uploads', filePath)
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

/**
 * Get file stats helper
 */
export const getFileStats = (filePath: string): {
  exists: boolean
  size?: number
  createdAt?: Date
  modifiedAt?: Date
} => {
  try {
    const fullPath = path.join(process.cwd(), 'uploads', filePath)
    
    if (!fs.existsSync(fullPath)) {
      return { exists: false }
    }
    
    const stats = fs.statSync(fullPath)
    return {
      exists: true,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    }
  } catch (error) {
    return { exists: false }
  }
}

/**
 * Clean up old files (for maintenance)
 */
export const cleanupOldFiles = async (maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> => {
  const now = Date.now()
  const dirs = ['avatars', 'posts', 'covers']
  
  for (const dir of dirs) {
    const dirPath = path.join(uploadDir, dir)
    
    try {
      if (!fs.existsSync(dirPath)) continue
      
      const files = await fs.promises.readdir(dirPath)
      
      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = await fs.promises.stat(filePath)
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.promises.unlink(filePath)
          console.log(`Cleaned up old file: ${file}`)
        }
      }
    } catch (error) {
      console.error(`Error cleaning up directory ${dir}:`, error)
    }
  }
}

/**
 * Validate file type by content (additional security)
 */
export const validateFileContent = async (filePath: string): Promise<boolean> => {
  try {
    const buffer = await fs.promises.readFile(filePath)
    
    // Check for common image file signatures
    const signatures = {
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif: [0x47, 0x49, 0x46],
      webp: [0x52, 0x49, 0x46, 0x46], // RIFF (first 4 bytes of WebP)
    }
    
    for (const [type, signature] of Object.entries(signatures)) {
      if (signature.every((byte, index) => buffer[index] === byte)) {
        return true
      }
    }
    
    return false
  } catch (error) {
    return false
  }
}

/**
 * Create thumbnail (placeholder - would need image processing library)
 */
export const createThumbnail = async (
  sourcePath: string, 
  thumbnailPath: string, 
  width: number = 300, 
  height: number = 300
): Promise<void> => {
  // This is a placeholder function
  // In production, you would use libraries like Sharp or Jimp
  console.log(`Would create thumbnail: ${sourcePath} -> ${thumbnailPath} (${width}x${height})`)
}

/**
 * Get upload progress middleware (for large file uploads)
 */
export const uploadProgress = (req: Request & { uploadProgress?: number }, res: any, next: any) => {
  let totalSize = 0
  let receivedSize = 0
  
  req.on('data', (chunk) => {
    receivedSize += chunk.length
    if (totalSize > 0) {
      req.uploadProgress = Math.round((receivedSize / totalSize) * 100)
    }
  })
  
  const contentLength = req.headers['content-length']
  if (contentLength) {
    totalSize = parseInt(contentLength, 10)
  }
  
  next()
}