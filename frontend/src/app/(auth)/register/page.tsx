'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isRegistering } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data
    registerUser(registerData)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        {/* Logo & Header */}
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center mb-4'>
            <UserPlus className='h-6 w-6 text-white' />
          </div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
            새로운 시작을 환영합니다
          </h1>
          <p className='text-muted-foreground mt-2'>
            계정을 만들고 블로그 커뮤니티에 참여하세요
          </p>
        </div>

        {/* Register Form */}
        <Card className='border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
          <CardHeader className='space-y-1 pb-6'>
            <CardTitle className='text-2xl font-semibold text-center'>
              회원가입
            </CardTitle>
            <CardDescription className='text-center'>
              필수 정보를 입력하여 계정을 만드세요
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className='space-y-4'>
              {/* Name Field */}
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-sm font-medium'>
                  이름 (선택사항)
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='name'
                    type='text'
                    placeholder='실명 또는 닉네임'
                    className='pl-10 h-11'
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className='text-red-500 text-sm'>{errors.name.message}</p>
                )}
              </div>

              {/* Username Field */}
              <div className='space-y-2'>
                <Label htmlFor='username' className='text-sm font-medium'>
                  사용자명 *
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='username'
                    type='text'
                    placeholder='사용자명 (영문, 숫자, _ 가능)'
                    className={cn(
                      'pl-10 h-11',
                      errors.username &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className='text-red-500 text-sm'>
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  이메일 *
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='your@email.com'
                    className={cn(
                      'pl-10 h-11',
                      errors.email &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className='text-red-500 text-sm'>{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  비밀번호 *
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='8자 이상, 대소문자+숫자 포함'
                    className={cn(
                      'pl-10 pr-10 h-11',
                      errors.password &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    {...register('password')}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className='text-red-500 text-sm'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className='space-y-2'>
                <Label
                  htmlFor='confirmPassword'
                  className='text-sm font-medium'
                >
                  비밀번호 확인 *
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='비밀번호를 다시 입력하세요'
                    className={cn(
                      'pl-10 pr-10 h-11',
                      errors.confirmPassword &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    {...register('confirmPassword')}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-red-500 text-sm'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className='flex flex-col space-y-4 pt-4'>
              {/* Register Button */}
              <Button
                type='submit'
                className='w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium transition-all duration-200'
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    회원가입 중...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <UserPlus className='h-4 w-4' />
                    계정 만들기
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className='relative flex items-center'>
                <div className='flex-1 border-t border-muted' />
                <span className='px-3 text-xs text-muted-foreground bg-background'>
                  또는
                </span>
                <div className='flex-1 border-t border-muted' />
              </div>

              {/* Login Link */}
              <div className='text-center text-sm'>
                <span className='text-muted-foreground'>
                  이미 계정이 있으신가요?{' '}
                </span>
                <Link
                  href='/login'
                  className='text-blue-600 hover:text-blue-500 font-medium transition-colors'
                >
                  로그인
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className='text-center'>
          <p className='text-xs text-muted-foreground'>
            회원가입함으로써{' '}
            <Link href='/terms' className='text-blue-600 hover:underline'>
              이용약관
            </Link>
            과{' '}
            <Link href='/privacy' className='text-blue-600 hover:underline'>
              개인정보처리방침
            </Link>
            에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
