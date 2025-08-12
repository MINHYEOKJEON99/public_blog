import { Router, Request, Response } from 'express'
import { auth } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error'
import { 
  uploadSingle, 
  uploadMultiple, 
  uploadAvatar, 
  uploadPostImage, 
  uploadCoverImage,
  uploadRateLimit,
  getFileUrl,
  deleteFile,
  getFileStats,
  validateFileContent,
} from '@/middleware/upload'
import { ApiResponse, AuthenticatedRequest } from '@/types'
import path from 'path'
import fs from 'fs'

const router = Router()

/**
 * Upload single file
 * POST /api/upload/file
 */
router.post(
  '/file',
  auth,
  uploadRateLimit,
  uploadSingle('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      } as ApiResponse)
    }
    
    // Validate file content for security
    const isValid = await validateFileContent(req.file.path)
    if (!isValid) {
      // Delete invalid file
      await deleteFile(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Invalid file format detected',
      } as ApiResponse)
    }
    
    const fileUrl = getFileUrl(req.file.filename, 'posts')
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        path: req.file.path,
      },
    } as ApiResponse)
  })
)

/**
 * Upload multiple files
 * POST /api/upload/files
 */
router.post(
  '/files',
  auth,
  uploadRateLimit,
  uploadMultiple('files', 5),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      } as ApiResponse)
    }
    
    const uploadedFiles = []
    const invalidFiles = []
    
    // Validate each file
    for (const file of req.files) {
      const isValid = await validateFileContent(file.path)
      
      if (isValid) {
        const fileUrl = getFileUrl(file.filename, 'posts')
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: fileUrl,
          path: file.path,
        })
      } else {
        invalidFiles.push(file.originalname)
        await deleteFile(file.path)
      }
    }
    
    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All uploaded files were invalid',
        data: { invalidFiles },
      } as ApiResponse)
    }
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: {
        files: uploadedFiles,
        ...(invalidFiles.length > 0 && { invalidFiles }),
      },
    } as ApiResponse)
  })
)

/**
 * Upload avatar image
 * POST /api/upload/avatar
 */
router.post(
  '/avatar',
  auth,
  uploadRateLimit,
  uploadAvatar,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file uploaded',
      } as ApiResponse)
    }
    
    // Validate file content
    const isValid = await validateFileContent(req.file.path)
    if (!isValid) {
      await deleteFile(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Invalid image format detected',
      } as ApiResponse)
    }
    
    const avatarUrl = getFileUrl(req.file.filename, 'avatars')
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: avatarUrl,
      },
    } as ApiResponse)
  })
)

/**
 * Upload post image
 * POST /api/upload/post-image
 */
router.post(
  '/post-image',
  auth,
  uploadRateLimit,
  uploadPostImage,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded',
      } as ApiResponse)
    }
    
    // Validate file content
    const isValid = await validateFileContent(req.file.path)
    if (!isValid) {
      await deleteFile(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Invalid image format detected',
      } as ApiResponse)
    }
    
    const imageUrl = getFileUrl(req.file.filename, 'posts')
    
    res.json({
      success: true,
      message: 'Post image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl,
        markdown: `![${req.file.originalname}](${imageUrl})`,
        html: `<img src="${imageUrl}" alt="${req.file.originalname}" />`,
      },
    } as ApiResponse)
  })
)

/**
 * Upload cover image
 * POST /api/upload/cover-image
 */
router.post(
  '/cover-image',
  auth,
  uploadRateLimit,
  uploadCoverImage,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No cover image uploaded',
      } as ApiResponse)
    }
    
    // Validate file content
    const isValid = await validateFileContent(req.file.path)
    if (!isValid) {
      await deleteFile(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Invalid image format detected',
      } as ApiResponse)
    }
    
    const coverUrl = getFileUrl(req.file.filename, 'covers')
    
    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: coverUrl,
      },
    } as ApiResponse)
  })
)

/**
 * Get file information
 * GET /api/upload/info/:filename
 */
router.get(
  '/info/:filename',
  auth,
  asyncHandler(async (req: Request, res: Response) => {
    const { filename } = req.params
    const subDir = req.query.dir as string || 'posts'
    
    const filePath = path.join(subDir, filename)
    const stats = getFileStats(filePath)
    
    if (!stats.exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      } as ApiResponse)
    }
    
    const fileUrl = getFileUrl(filename, subDir)
    
    res.json({
      success: true,
      data: {
        filename,
        url: fileUrl,
        size: stats.size,
        createdAt: stats.createdAt,
        modifiedAt: stats.modifiedAt,
      },
    } as ApiResponse)
  })
)

/**
 * Delete uploaded file
 * DELETE /api/upload/:filename
 */
router.delete(
  '/:filename',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { filename } = req.params
    const subDir = req.query.dir as string || 'posts'
    
    const filePath = path.join(subDir, filename)
    const stats = getFileStats(filePath)
    
    if (!stats.exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      } as ApiResponse)
    }
    
    // TODO: Check if user owns the file (implement file ownership tracking)
    // For now, only admins can delete any file, users can delete their own avatar
    if (req.user!.role !== 'ADMIN' && subDir !== 'avatars') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own files',
      } as ApiResponse)
    }
    
    await deleteFile(filePath)
    
    res.json({
      success: true,
      message: 'File deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Get upload statistics
 * GET /api/upload/stats
 */
router.get(
  '/stats',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      } as ApiResponse)
    }
    
    const uploadDir = path.join(process.cwd(), 'uploads')
    const dirs = ['avatars', 'posts', 'covers']
    const stats: any = {
      totalFiles: 0,
      totalSize: 0,
      directories: {},
    }
    
    for (const dir of dirs) {
      const dirPath = path.join(uploadDir, dir)
      
      try {
        if (!fs.existsSync(dirPath)) {
          stats.directories[dir] = { files: 0, size: 0 }
          continue
        }
        
        const files = await fs.promises.readdir(dirPath)
        let dirSize = 0
        
        for (const file of files) {
          const filePath = path.join(dirPath, file)
          const fileStat = await fs.promises.stat(filePath)
          dirSize += fileStat.size
        }
        
        stats.directories[dir] = {
          files: files.length,
          size: dirSize,
          sizeFormatted: formatBytes(dirSize),
        }
        
        stats.totalFiles += files.length
        stats.totalSize += dirSize
      } catch (error) {
        stats.directories[dir] = { files: 0, size: 0, error: 'Unable to read directory' }
      }
    }
    
    stats.totalSizeFormatted = formatBytes(stats.totalSize)
    
    res.json({
      success: true,
      data: stats,
    } as ApiResponse)
  })
)

/**
 * Clean up old files (admin only)
 * POST /api/upload/cleanup
 */
router.post(
  '/cleanup',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      } as ApiResponse)
    }
    
    const maxAge = parseInt(req.body.maxAge as string) || 30 * 24 * 60 * 60 * 1000 // 30 days
    
    try {
      const { cleanupOldFiles } = await import('@/middleware/upload')
      await cleanupOldFiles(maxAge)
      
      res.json({
        success: true,
        message: 'File cleanup completed',
      } as ApiResponse)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'File cleanup failed',
        error: (error as Error).message,
      } as ApiResponse)
    }
  })
)

/**
 * Helper function to format bytes
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export default router