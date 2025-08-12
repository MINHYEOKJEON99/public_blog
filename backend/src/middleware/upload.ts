import multer from 'multer'
import path from 'path'
import fs from 'fs'
import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'
import config from '@/utils/config'

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.UPLOAD_DIR)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Create subdirectories
const createSubDirs = () => {
  const dirs = ['avatars', 'posts', 'covers', 'general']
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
    let subDir = 'general'
    
    if (req.path.includes('avatar')) {
      subDir = 'avatars'
    } else if (req.path.includes('cover')) {
      subDir = 'covers'
    } else if (req.path.includes('image') || req.path.includes('post')) {
      subDir = 'posts'
    }
    
    const destinationPath = path.join(uploadDir, subDir)
    cb(null, destinationPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, extension)
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
    
    cb(null, `${sanitizedBaseName}_${uniqueSuffix}${extension}`)
  }
})

/**
 * File filter
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = config.ALLOWED_FILE_TYPES.split(',')
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1)
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`))
  }
}

/**
 * Base multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 10
  }
})

/**
 * Upload middleware functions
 */
export const uploadSingle = (fieldName: string = 'file') => upload.single(fieldName)
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => upload.array(fieldName, maxCount)
export const uploadAvatar = upload.single('avatar')
export const uploadPostImage = upload.single('image')
export const uploadCoverImage = upload.single('cover')

/**
 * Rate limiting for uploads
 */
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Get file URL helper
 */
export const getFileUrl = (filename: string, subDir: string = 'general'): string => {
  return `/uploads/${subDir}/${filename}`
}

/**
 * Delete file helper
 */
export const deleteFile = (filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(uploadDir, filepath)
    
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Get file stats
 */
export const getFileStats = (filepath: string): Promise<fs.Stats | null> => {
  return new Promise((resolve) => {
    const fullPath = path.join(uploadDir, filepath)
    
    fs.stat(fullPath, (err, stats) => {
      if (err) {
        resolve(null)
      } else {
        resolve(stats)
      }
    })
  })
}

/**
 * Validate file content
 */
export const validateFileContent = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file && !req.files) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    })
    return
  }
  
  next()
}