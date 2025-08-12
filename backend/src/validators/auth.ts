import { z } from 'zod'

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email must be less than 255 characters'),
    password: z.string()
      .min(1, 'Password is required')
      .max(128, 'Password must be less than 128 characters'),
  }),
})

export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email must be less than 255 characters'),
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    name: z.string()
      .max(100, 'Name must be less than 100 characters')
      .optional(),
  }),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email must be less than 255 characters'),
  }),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Token is required')
      .max(255, 'Token must be less than 255 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  }),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required')
      .max(128, 'Password must be less than 128 characters'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  }),
})

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .max(100, 'Name must be less than 100 characters')
      .optional(),
    bio: z.string()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
    avatar: z.string()
      .url('Avatar must be a valid URL')
      .max(255, 'Avatar URL must be less than 255 characters')
      .optional(),
  }),
})

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
      .min(1, 'Refresh token is required'),
  }),
})

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Token is required')
      .max(255, 'Token must be less than 255 characters'),
  }),
})

// Alias for compatibility with route imports
export const updateUserSchema = updateProfileSchema

export type LoginRequest = z.infer<typeof loginSchema>['body']
export type RegisterRequest = z.infer<typeof registerSchema>['body']
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>['body']
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>['body']
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>['body']
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>['body']
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>['body']
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>['body']