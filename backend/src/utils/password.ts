import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import config from './config'

export class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = config.BCRYPT_ROUNDS
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate a password reset token
   */
  static generateResetToken(): string {
    return this.generateSecureToken(32)
  }

  /**
   * Generate an email verification token
   */
  static generateVerificationToken(): string {
    return this.generateSecureToken(32)
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    // Check for common passwords
    const commonPasswords = [
      'password',
      '12345678',
      'qwerty123',
      'abc123456',
      'password123',
      '123456789',
      'welcome123',
    ]

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Generate a secure session ID
   */
  static generateSessionId(): string {
    return this.generateSecureToken(48)
  }

  /**
   * Hash sensitive data (like emails for comparison)
   */
  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }
}