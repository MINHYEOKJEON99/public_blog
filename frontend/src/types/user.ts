export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  postsCount: number
  commentsCount: number
  likesCount: number
  followersCount?: number
  followingCount?: number
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface AuthUser extends User {
  preferences?: UserPreferences
}