'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '@/components/common/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { QuickTooltip } from '@/components/ui/Tooltip'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Search,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  ArrowRight,
  BookOpen,
  Users,
  Star,
  Code,
  Palette,
  Database,
  Globe,
  Rocket,
  Award,
  ChevronRight,
  PlayCircle,
  Download,
  Share2,
  Bookmark,
  Grid3X3,
  List,
  Sparkles,
  Trophy,
  Target,
  Lightbulb,
  Coffee,
} from 'lucide-react'

// Mock data - Enhanced with more realistic content
const mockPosts = [
  {
    id: '1',
    title: 'React 19와 Next.js 15로 구축하는 차세대 웹 애플리케이션',
    excerpt:
      'React의 최신 Concurrent 기능과 Next.js 15의 App Router를 활용하여 성능과 사용자 경험을 극대화하는 실전 가이드입니다.',
    coverImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    author: {
      id: '1',
      username: 'react_master',
      name: '김리액트',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    category: {
      id: '1',
      name: 'Frontend',
      slug: 'frontend',
      color: 'from-blue-500 to-cyan-500',
    },
    tags: [
      { id: '1', name: 'React 19', slug: 'react-19' },
      { id: '2', name: 'Next.js', slug: 'nextjs' },
      { id: '3', name: 'TypeScript', slug: 'typescript' },
    ],
    likesCount: 324,
    commentsCount: 89,
    viewCount: 2156,
    readingTime: 12,
    difficulty: 'intermediate',
    trending: true,
    featured: true,
    createdAt: '2024-01-15T10:30:00Z',
    publishedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Node.js 와 Prisma ORM으로 확장 가능한 API 서버 구축하기',
    excerpt:
      'TypeScript, Node.js, Prisma를 활용한 현대적인 백엔드 아키텍처 설계부터 배포까지의 완벽 가이드',
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    author: {
      id: '2',
      username: 'backend_ninja',
      name: '이백엔드',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    category: {
      id: '2',
      name: 'Backend',
      slug: 'backend',
      color: 'from-green-500 to-emerald-500',
    },
    tags: [
      { id: '4', name: 'Node.js', slug: 'nodejs' },
      { id: '5', name: 'Prisma', slug: 'prisma' },
      { id: '6', name: 'API', slug: 'api' },
    ],
    likesCount: 256,
    commentsCount: 67,
    viewCount: 1834,
    readingTime: 15,
    difficulty: 'advanced',
    trending: false,
    featured: true,
    createdAt: '2024-01-14T14:20:00Z',
    publishedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'Figma에서 코드로: 디자인 시스템 구축의 모든 것',
    excerpt:
      '실제 프로덕션 환경에서 사용되는 디자인 시스템을 만들고 관리하는 실전 노하우와 베스트 프랙티스',
    coverImage:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    author: {
      id: '3',
      username: 'design_guru',
      name: '박디자인',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616c00e7e6e?w=100&h=100&fit=crop&crop=face',
    },
    category: {
      id: '3',
      name: 'Design',
      slug: 'design',
      color: 'from-purple-500 to-pink-500',
    },
    tags: [
      { id: '7', name: 'Design System', slug: 'design-system' },
      { id: '8', name: 'Figma', slug: 'figma' },
      { id: '9', name: 'UI/UX', slug: 'ui-ux' },
    ],
    likesCount: 445,
    commentsCount: 123,
    viewCount: 3298,
    readingTime: 10,
    difficulty: 'intermediate',
    trending: true,
    featured: false,
    createdAt: '2024-01-13T09:15:00Z',
    publishedAt: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    title: 'AI와 개발자: ChatGPT를 활용한 효율적인 코딩 워크플로우',
    excerpt:
      '생성형 AI를 개발 프로세스에 통합하여 생산성을 극대화하는 실전 전략과 도구들',
    coverImage:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    author: {
      id: '4',
      username: 'ai_enthusiast',
      name: '최인공지능',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    },
    category: {
      id: '4',
      name: 'AI/ML',
      slug: 'ai-ml',
      color: 'from-indigo-500 to-purple-500',
    },
    tags: [
      { id: '10', name: 'AI', slug: 'ai' },
      { id: '11', name: 'ChatGPT', slug: 'chatgpt' },
      { id: '12', name: 'Productivity', slug: 'productivity' },
    ],
    likesCount: 178,
    commentsCount: 45,
    viewCount: 1456,
    readingTime: 8,
    difficulty: 'beginner',
    trending: true,
    featured: false,
    createdAt: '2024-01-12T16:45:00Z',
    publishedAt: '2024-01-12T16:45:00Z',
  },
]

const mockCategories = [
  {
    id: '1',
    name: 'Frontend',
    slug: 'frontend',
    postsCount: 142,
    color: 'from-blue-500 to-cyan-500',
    icon: Code,
  },
  {
    id: '2',
    name: 'Backend',
    slug: 'backend',
    postsCount: 98,
    color: 'from-green-500 to-emerald-500',
    icon: Database,
  },
  {
    id: '3',
    name: 'Design',
    slug: 'design',
    postsCount: 67,
    color: 'from-purple-500 to-pink-500',
    icon: Palette,
  },
  {
    id: '4',
    name: 'AI/ML',
    slug: 'ai-ml',
    postsCount: 34,
    color: 'from-indigo-500 to-purple-500',
    icon: Lightbulb,
  },
  {
    id: '5',
    name: 'DevOps',
    slug: 'devops',
    postsCount: 23,
    color: 'from-orange-500 to-red-500',
    icon: Globe,
  },
  {
    id: '6',
    name: 'Mobile',
    slug: 'mobile',
    postsCount: 56,
    color: 'from-teal-500 to-blue-500',
    icon: Coffee,
  },
]

const statsData = [
  {
    label: '활성 사용자',
    value: '12,547',
    displayValue: '12,547',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    label: '총 포스트',
    value: '2,847',
    displayValue: '2,847',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-500',
  },
  {
    label: '월간 조회수',
    value: '187K',
    displayValue: '187K',
    icon: Eye,
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: '커뮤니티 점수',
    value: '96%',
    displayValue: '96%',
    icon: Trophy,
    color: 'from-yellow-500 to-orange-500',
  },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR')
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentStats, setCurrentStats] = useState(
    statsData.map(stat => ({ ...stat, displayValue: '0' }))
  )

  // Animated counter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStats(statsData)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || post.category.slug === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Layout>
      {/* Hero Section - Completely Redesigned */}
      <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
        {/* Animated Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30' />

        {/* Floating Elements */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <motion.div
            className='absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl'
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl'
            animate={{
              y: [20, -20, 20],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl'
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -180, -360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Main Hero Content */}
        <div className='relative z-10 container mx-auto px-4 text-center max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant='default' className='mb-6' animated pulse>
              <Sparkles className='w-4 h-4 mr-1' />
              개발자를 위한 프리미엄 지식 플랫폼
            </Badge>
          </motion.div>

          <motion.h1
            className='text-5xl md:text-7xl lg:text-8xl font-black mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.span
              className='inline-block'
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              코드와
            </motion.span>
            <br />
            <motion.span
              className='inline-block'
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              창의력이
            </motion.span>
            <br />
            <motion.span
              className='inline-block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              만나는 곳
            </motion.span>
          </motion.h1>

          <motion.p
            className='text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            최신 기술 트렌드부터 심층적인 튜토리얼까지,
            <br className='hidden md:block' />전 세계 개발자들과 함께 성장하는
            프리미엄 커뮤니티
          </motion.p>

          {/* Enhanced Search Bar */}
          <motion.div
            className='max-w-2xl mx-auto mb-10'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200'></div>
              <div className='relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center space-x-3'>
                  <Search className='h-5 w-5 text-muted-foreground ml-4' />
                  <Input
                    type='text'
                    placeholder='어떤 기술을 배우고 싶으신가요?'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='flex-1 bg-transparent border-none focus:ring-0 text-lg h-12'
                    variant='default'
                  />
                  <Button size='lg' variant='default' className='mr-2'>
                    <Rocket className='w-5 h-5 mr-2' />
                    탐색하기
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className='flex flex-col sm:flex-row gap-4 justify-center items-center'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size='xl' variant='default' className='group' asChild>
                <Link href='/posts'>
                  <BookOpen className='w-5 h-5 mr-2 group-hover:rotate-12 transition-transform' />
                  모든 포스트 둘러보기
                  <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size='xl' variant='outline' className='group' asChild>
                <Link href='/register'>
                  <Users className='w-5 h-5 mr-2 group-hover:scale-110 transition-transform' />
                  커뮤니티 참여하기
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            {currentStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className='text-center'
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
              >
                <div
                  className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-r',
                    stat.color
                  )}
                >
                  <stat.icon className='w-6 h-6 text-white' />
                </div>
                <div className='text-2xl font-bold text-foreground'>
                  {stat.displayValue}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className='py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50'>
        <div className='container mx-auto px-4 max-w-7xl'>
          {/* Section Header */}
          <motion.div
            className='flex items-center justify-between mb-16'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl'>
                <TrendingUp className='w-8 h-8 text-white' />
              </div>
              <div>
                <h2 className='text-4xl md:text-5xl font-bold mb-2'>
                  트렌딩 포스트
                </h2>
                <p className='text-muted-foreground text-lg'>
                  개발자들이 가장 주목하는 최신 콘텐츠
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className='hidden md:flex items-center space-x-2'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className='w-4 h-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
              >
                <List className='w-4 h-4' />
              </Button>
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className='mb-12'
            >
              <TabsList
                variant='pills'
                className='grid w-full grid-cols-4 lg:grid-cols-7 max-w-4xl mx-auto'
              >
                <TabsTrigger value='all' variant='pills' className='text-sm'>
                  전체
                </TabsTrigger>
                {mockCategories.map(category => (
                  <TabsTrigger
                    key={category.slug}
                    value={category.slug}
                    variant='pills'
                    className='text-sm'
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Posts Grid */}
          <div
            className={cn(
              'grid gap-8',
              viewMode === 'grid'
                ? 'md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  className={cn(
                    'group cursor-pointer',
                    index === 0 && viewMode === 'grid'
                      ? 'md:col-span-2 md:row-span-1'
                      : '',
                    viewMode === 'list' ? 'flex space-x-6' : ''
                  )}
                  whileHover={{ y: -8 }}
                >
                  <Card className='overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 h-full'>
                    {/* Image Container */}
                    <div
                      className={cn(
                        'relative overflow-hidden',
                        viewMode === 'list' ? 'w-80 flex-shrink-0' : '',
                        index === 0 && viewMode === 'grid'
                          ? 'aspect-[2/1]'
                          : 'aspect-video'
                      )}
                    >
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        width={800}
                        height={400}
                        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                      />

                      {/* Overlay Badges */}
                      <div className='absolute top-4 left-4 flex space-x-2'>
                        {post.trending && (
                          <Badge variant='default' className='text-xs' animated>
                            <TrendingUp className='w-3 h-3 mr-1' />
                            트렌딩
                          </Badge>
                        )}
                        {post.featured && (
                          <Badge variant='success' className='text-xs'>
                            <Star className='w-3 h-3 mr-1' />
                            추천
                          </Badge>
                        )}
                      </div>

                      {/* Reading Time & Difficulty */}
                      <div className='absolute bottom-4 right-4 flex space-x-2'>
                        <Badge variant='outline' size='sm'>
                          <Clock className='w-3 h-3 mr-1' />
                          {post.readingTime}분
                        </Badge>
                        <Badge
                          variant={
                            post.difficulty === 'beginner'
                              ? 'success'
                              : post.difficulty === 'intermediate'
                                ? 'warning'
                                : 'destructive'
                          }
                          size='sm'
                        >
                          {post.difficulty === 'beginner'
                            ? '초급'
                            : post.difficulty === 'intermediate'
                              ? '중급'
                              : '고급'}
                        </Badge>
                      </div>

                      {/* Play Button Overlay */}
                      <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            size='lg'
                            variant='outline'
                            className='rounded-full w-16 h-16'
                          >
                            <PlayCircle className='w-8 h-8' />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='p-6 flex-1'>
                      {/* Category & Date */}
                      <div className='flex items-center justify-between mb-4'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'bg-gradient-to-r text-white border-0',
                            post.category.color
                          )}
                        >
                          {post.category.name}
                        </Badge>
                        <span className='text-sm text-muted-foreground flex items-center'>
                          <Clock className='w-3 h-3 mr-1' />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <CardTitle
                        className={cn(
                          'line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3',
                          index === 0 && viewMode === 'grid'
                            ? 'text-2xl md:text-3xl'
                            : 'text-xl'
                        )}
                      >
                        {post.title}
                      </CardTitle>

                      {/* Excerpt */}
                      <CardDescription
                        className={cn(
                          'line-clamp-3 mb-6',
                          index === 0 && viewMode === 'grid'
                            ? 'text-base'
                            : 'text-sm'
                        )}
                      >
                        {post.excerpt}
                      </CardDescription>

                      {/* Author & Stats */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <Avatar size='sm' animated status='online'>
                            <AvatarImage
                              src={post.author.avatar}
                              alt={post.author.name}
                            />
                            <AvatarFallback>
                              {post.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='text-sm font-medium'>
                              {post.author.name}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              @{post.author.username}
                            </div>
                          </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                          <div className='flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer'>
                            <Heart className='w-4 h-4' />
                            <span>{post.likesCount}</span>
                          </div>

                          <div className='flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer'>
                            <MessageCircle className='w-4 h-4' />
                            <span>{post.commentsCount}</span>
                          </div>

                          <div className='flex items-center space-x-1'>
                            <Eye className='w-4 h-4' />
                            <span>{post.viewCount.toLocaleString()}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8'
                            >
                              <Bookmark className='w-4 h-4' />
                            </Button>

                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8'
                            >
                              <Share2 className='w-4 h-4' />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className='flex flex-wrap gap-2 mt-4'>
                        {post.tags.map(tag => (
                          <Badge
                            key={tag.id}
                            variant='secondary'
                            size='sm'
                            className='hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer'
                          >
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          <motion.div
            className='text-center mt-16'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button size='lg' variant='outline' className='group'>
              더 많은 포스트 보기
              <ChevronRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className='py-24'>
        <div className='container mx-auto px-4 max-w-6xl'>
          <motion.div
            className='text-center mb-16'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant='outline' className='mb-4'>
              <Target className='w-4 h-4 mr-2' />
              전문 분야별 콘텐츠
            </Badge>
            <h2 className='text-4xl md:text-5xl font-bold mb-4'>
              관심사별 맞춤 학습
            </h2>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
              각 분야의 전문가들이 엄선한 고품질 콘텐츠로 체계적인 학습이
              가능합니다
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {mockCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={`/category/${category.slug}`}>
                  <Card className='p-8 text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
                    {/* Icon */}
                    <motion.div
                      className={cn(
                        'w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-r shadow-lg',
                        category.color
                      )}
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <category.icon className='w-8 h-8 text-white' />
                    </motion.div>

                    {/* Content */}
                    <h3 className='text-2xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                      {category.name}
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                      {category.postsCount}개의 포스트
                    </p>

                    {/* Progress Bar */}
                    <Progress
                      value={
                        (category.postsCount /
                          Math.max(...mockCategories.map(c => c.postsCount))) *
                        100
                      }
                      variant='default'
                      className='mb-4'
                      animated
                    />

                    {/* CTA */}
                    <Button
                      variant='ghost'
                      className='group-hover:bg-primary group-hover:text-primary-foreground transition-all'
                    >
                      탐색하기
                      <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                    </Button>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA Section */}
      <section className='py-24 relative overflow-hidden'>
        {/* Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600' />
        <div className='absolute inset-0 bg-black/20' />

        {/* Animated Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <motion.div
            className='absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-70'
            animate={{
              scale: [1, 2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className='absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-60'
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className='absolute bottom-1/4 left-1/3 w-3 h-3 bg-white rounded-full opacity-50'
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        <div className='relative container mx-auto px-4 text-center max-w-4xl text-white'>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Badge
              variant='secondary'
              className='mb-6 bg-white/20 text-white border-white/30'
            >
              <Users className='w-4 h-4 mr-2' />
              커뮤니티 참여하기
            </Badge>

            <h2 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
              함께 성장하는
              <br />
              개발자 네트워크
            </h2>

            <p className='text-xl md:text-2xl opacity-90 mb-12 leading-relaxed'>
              전 세계 개발자들과 소통하고, 최신 트렌드를 공유하며,
              <br />
              서로의 성장을 응원하는 프리미엄 커뮤니티에 참여하세요
            </p>

            <div className='flex flex-col sm:flex-row gap-6 justify-center'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size='xl'
                  variant='secondary'
                  className='bg-white text-blue-600 hover:bg-gray-100 shadow-xl group'
                  asChild
                >
                  <Link href='/register'>
                    <Rocket className='w-6 h-6 mr-2 group-hover:rotate-12 transition-transform' />
                    무료로 시작하기
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size='xl'
                  variant='outline'
                  className='border-2 border-white/30 text-white hover:bg-white/10 group'
                  asChild
                >
                  <Link href='/posts'>
                    <Download className='w-6 h-6 mr-2 group-hover:translate-y-1 transition-transform' />
                    둘러보기
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Social Proof */}
            <motion.div
              className='mt-16 flex flex-wrap justify-center items-center gap-8 opacity-80'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className='flex items-center space-x-2'>
                <Award className='w-5 h-5' />
                <span className='text-sm'>99% 만족도</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Users className='w-5 h-5' />
                <span className='text-sm'>12,000+ 개발자</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Globe className='w-5 h-5' />
                <span className='text-sm'>50개국</span>
              </div>
              <div className='flex items-center space-x-2'>
                <BookOpen className='w-5 h-5' />
                <span className='text-sm'>2,800+ 포스트</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
