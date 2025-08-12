import jwt from 'jsonwebtoken'
import { JwtPayload } from '@/types'
import config from './config'

export class JWTService {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
      issuer: 'public-blog-api',
      audience: 'public-blog-app',
    })
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      issuer: 'public-blog-api',
      audience: 'public-blog-app',
    })
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        issuer: 'public-blog-api',
        audience: 'public-blog-app',
      }) as JwtPayload
      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token')
      }
      throw new Error('Token verification failed')
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        issuer: 'public-blog-api',
        audience: 'public-blog-app',
      }) as JwtPayload
      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token')
      }
      throw new Error('Refresh token verification failed')
    }
  }

  static generateTokens(payload: JwtPayload): {
    accessToken: string
    refreshToken: string
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }

  static getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any
      if (!decoded || !decoded.exp) {
        return null
      }
      return new Date(decoded.exp * 1000)
    } catch (error) {
      return null
    }
  }

  static isTokenExpired(token: string): boolean {
    const expirationDate = this.getTokenExpirationDate(token)
    if (!expirationDate) {
      return true
    }
    return expirationDate < new Date()
  }
}