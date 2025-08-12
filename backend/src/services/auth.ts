import { User, Role } from '@prisma/client'
import { db } from '@/utils/database'
import { PasswordService } from '@/utils/password'
import { JWTService } from '@/utils/jwt'
import { SlugService } from '@/utils/slug'
import { EmailService } from './email'
import { AppError } from '@/middleware/error'
import config from '@/utils/config'
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
  UpdateUserRequest,
} from '@/types'

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingEmail) {
      throw new AppError('Email already registered', 409)
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username: data.username },
    })

    if (existingUsername) {
      throw new AppError('Username already taken', 409)
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePassword(data.password)
    if (!passwordValidation.isValid) {
      throw new AppError('Password does not meet requirements', 422, true, {
        password: passwordValidation.errors,
      })
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(data.password)

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username,
        password: hashedPassword,
        name: data.name,
      },
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

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const { accessToken, refreshToken } = JWTService.generateTokens(tokenPayload)

    // Store refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user.email, user.name || user.username)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
    }

    // Generate email verification token and send email
    try {
      await this.sendVerificationEmail(user.id, user.email, user.name || user.username)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    return {
      user,
      token: accessToken,
      refreshToken,
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        verified: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(data.password, user.password)
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const { accessToken, refreshToken } = JWTService.generateTokens(tokenPayload)

    // Store refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    // Remove password from response
    const { password, ...userResponse } = user

    return {
      user: userResponse,
      token: accessToken,
      refreshToken,
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    // Verify refresh token
    const decoded = JWTService.verifyRefreshToken(refreshToken)

    // Find refresh token in database
    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401)
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await db.refreshToken.delete({
        where: { id: storedToken.id },
      })
      throw new AppError('Refresh token expired', 401)
    }

    // Generate new access token
    const tokenPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    }

    const accessToken = JWTService.generateAccessToken(tokenPayload)

    return { token: accessToken }
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string): Promise<void> {
    await db.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(userId: string): Promise<void> {
    await db.refreshToken.deleteMany({
      where: { userId },
    })
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await db.user.findUnique({
      where: { id: userId },
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
      throw new AppError('User not found', 404)
    }

    return user
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data,
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

    return updatedUser
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get current user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true, email: true, name: true, username: true },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isValidPassword = await PasswordService.verifyPassword(currentPassword, user.password)
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 400)
    }

    // Validate new password
    const passwordValidation = PasswordService.validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw new AppError('New password does not meet requirements', 422, true, {
        password: passwordValidation.errors,
      })
    }

    // Check if new password is different from current
    const isSamePassword = await PasswordService.verifyPassword(newPassword, user.password)
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', 400)
    }

    // Hash new password
    const hashedPassword = await PasswordService.hashPassword(newPassword)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    // Invalidate all refresh tokens for security
    await db.refreshToken.deleteMany({
      where: { userId },
    })

    // Send notification email
    try {
      await EmailService.sendPasswordChangeNotification(user.email, user.name || user.username)
    } catch (error) {
      console.error('Failed to send password change notification:', error)
    }
  }

  /**
   * Send password reset email
   */
  static async forgotPassword(email: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, username: true },
    })

    if (!user) {
      // Don't reveal if email exists for security
      return
    }

    // Generate reset token
    const resetToken = PasswordService.generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token
    await db.passwordReset.create({
      data: {
        email: user.email,
        token: resetToken,
        expiresAt,
      },
    })

    // Send reset email
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`
    await EmailService.sendPasswordResetEmail(user.email, user.name || user.username, resetUrl)
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find reset token
    const resetToken = await db.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    // Validate new password
    const passwordValidation = PasswordService.validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw new AppError('Password does not meet requirements', 422, true, {
        password: passwordValidation.errors,
      })
    }

    // Hash new password
    const hashedPassword = await PasswordService.hashPassword(newPassword)

    // Update user password and mark token as used
    await db.$transaction([
      db.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      db.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    // Invalidate all refresh tokens for security
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true },
    })

    if (user) {
      await db.refreshToken.deleteMany({
        where: { userId: user.id },
      })
    }
  }

  /**
   * Send email verification
   */
  static async sendVerificationEmail(userId: string, email: string, name: string): Promise<void> {
    // Generate verification token
    const verificationToken = PasswordService.generateVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    await db.emailVerification.upsert({
      where: { email },
      update: {
        token: verificationToken,
        expiresAt,
        used: false,
      },
      create: {
        email,
        token: verificationToken,
        expiresAt,
      },
    })

    // Send verification email
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`
    await EmailService.sendVerificationEmail(email, name, verificationUrl)
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    // Find verification token
    const verificationToken = await db.emailVerification.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!verificationToken) {
      throw new AppError('Invalid or expired verification token', 400)
    }

    // Update user and mark token as used
    await db.$transaction([
      db.user.update({
        where: { email: verificationToken.email },
        data: { verified: true },
      }),
      db.emailVerification.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ])
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<void> {
    await db.user.delete({
      where: { id: userId },
    })
  }

  /**
   * Clean up expired tokens (for maintenance)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    await db.$transaction([
      // Clean up expired refresh tokens
      db.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      }),
      // Clean up expired password reset tokens
      db.passwordReset.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // 7 days old
          ],
        },
      }),
      // Clean up expired email verification tokens
      db.emailVerification.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // 7 days old
          ],
        },
      }),
    ])

    console.log('🧹 Cleaned up expired authentication tokens')
  }
}