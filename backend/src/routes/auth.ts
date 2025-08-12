import { Router, Request, Response } from 'express'
import { AuthService } from '@/services/auth'
import { authRateLimit, strictRateLimit } from '@/middleware/security'
import { auth, optionalAuth } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { asyncHandler } from '@/middleware/error'
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateUserSchema,
} from '@/validators/auth'
import { ApiResponse, AuthenticatedRequest } from '@/types'

const router = Router()

/**
 * Register new user
 * POST /api/auth/register
 */
router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await AuthService.register(req.body)
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: authResponse,
    } as ApiResponse)
  })
)

/**
 * Login user
 * POST /api/auth/login
 */
router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await AuthService.login(req.body)
    
    res.json({
      success: true,
      message: 'Login successful',
      data: authResponse,
    } as ApiResponse)
  })
)

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const tokenResponse = await AuthService.refreshToken(refreshToken)
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokenResponse,
    } as ApiResponse)
  })
)

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post(
  '/logout',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = req.headers['x-refresh-token'] as string
    
    if (refreshToken) {
      await AuthService.logout(refreshToken)
    }
    
    res.json({
      success: true,
      message: 'Logout successful',
    } as ApiResponse)
  })
)

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
router.post(
  '/logout-all',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logoutAll(req.user!.id)
    
    res.json({
      success: true,
      message: 'Logged out from all devices',
    } as ApiResponse)
  })
)

/**
 * Get current user
 * GET /api/auth/me
 */
router.get(
  '/me',
  auth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.getCurrentUser(req.user!.id)
    
    res.json({
      success: true,
      data: user,
    } as ApiResponse)
  })
)

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put(
  '/profile',
  auth,
  validate(updateUserSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updatedUser = await AuthService.updateProfile(req.user!.id, req.body)
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    } as ApiResponse)
  })
)

/**
 * Change password
 * POST /api/auth/change-password
 */
router.post(
  '/change-password',
  auth,
  authRateLimit,
  validate(changePasswordSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body
    await AuthService.changePassword(req.user!.id, currentPassword, newPassword)
    
    res.json({
      success: true,
      message: 'Password changed successfully',
    } as ApiResponse)
  })
)

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  strictRateLimit,
  validate(forgotPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body
    await AuthService.forgotPassword(email)
    
    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    } as ApiResponse)
  })
)

/**
 * Reset password
 * POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  strictRateLimit,
  validate(resetPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body
    await AuthService.resetPassword(token, password)
    
    res.json({
      success: true,
      message: 'Password reset successful',
    } as ApiResponse)
  })
)

/**
 * Send email verification
 * POST /api/auth/verify-email/send
 */
router.post(
  '/verify-email/send',
  auth,
  strictRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.getCurrentUser(req.user!.id)
    
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      } as ApiResponse)
    }
    
    await AuthService.sendVerificationEmail(
      user.id,
      user.email,
      user.name || user.username
    )
    
    res.json({
      success: true,
      message: 'Verification email sent',
    } as ApiResponse)
  })
)

/**
 * Verify email
 * POST /api/auth/verify-email
 */
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body
    await AuthService.verifyEmail(token)
    
    res.json({
      success: true,
      message: 'Email verified successfully',
    } as ApiResponse)
  })
)

/**
 * Delete account
 * DELETE /api/auth/account
 */
router.delete(
  '/account',
  auth,
  strictRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.deleteAccount(req.user!.id)
    
    res.json({
      success: true,
      message: 'Account deleted successfully',
    } as ApiResponse)
  })
)

/**
 * Check if email is available
 * GET /api/auth/check/email/:email
 */
router.get(
  '/check/email/:email',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params
    
    try {
      const existingUser = await AuthService.getCurrentUser(email)
      res.json({
        success: true,
        data: { available: false },
      } as ApiResponse)
    } catch (error) {
      res.json({
        success: true,
        data: { available: true },
      } as ApiResponse)
    }
  })
)

/**
 * Check if username is available
 * GET /api/auth/check/username/:username
 */
router.get(
  '/check/username/:username',
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params
    
    try {
      // Try to find user by username (you'd need to implement this in AuthService)
      // For now, we'll use a direct DB query
      const existingUser = await require('@/utils/database').db.user.findUnique({
        where: { username },
        select: { id: true },
      })
      
      res.json({
        success: true,
        data: { available: !existingUser },
      } as ApiResponse)
    } catch (error) {
      res.json({
        success: true,
        data: { available: true },
      } as ApiResponse)
    }
  })
)

/**
 * Get authentication status (for frontend routing)
 * GET /api/auth/status
 */
router.get(
  '/status',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        authenticated: !!req.user,
        user: req.user || null,
      },
    } as ApiResponse)
  })
)

export default router