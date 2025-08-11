'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/common/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { 
  Search, Filter, Grid, List, Clock, Heart, MessageCircle, Eye, 
  ArrowRight, TrendingUp, Calendar, User, Tag, SortAsc, SortDesc
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    title: 'Next.js 13과 App Router로 현대적인 웹 앱 개발하기',
    excerpt: 'Next.js 13에서 도입된 App Router의 새로운 기능들과 실제 프로젝트에 적용하는 방법을 알아보겠습니다.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    slug: 'nextjs-13-app-router',
    author: {
      id: '1',
      username: 'techblogger',
      name: '김개발',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: '1', name: 'Frontend', slug: 'frontend' },
    tags: [
      { id: '1', name: 'Next.js', slug: 'nextjs' },
      { id: '2', name: 'React', slug: 'react' }
    ],
    likesCount: 89,
    commentsCount: 24,
    viewCount: 1247,
    readingTime: 8,
    createdAt: '2024-01-15T10:30:00Z',
    publishedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'TypeScript로 안전한 백엔드 API 구축하기',
    excerpt: 'Express.js와 TypeScript를 함께 사용하여 타입 안전한 RESTful API를 만드는 방법과 모범 사례를 소개합니다.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    slug: 'typescript-backend-api',
    author: {
      id: '2',
      username: 'backend_master',
      name: '박백엔드',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: '2', name: 'Backend', slug: 'backend' },
    tags: [
      { id: '3', name: 'TypeScript', slug: 'typescript' },
      { id: '4', name: 'Node.js', slug: 'nodejs' }
    ],
    likesCount: 67,
    commentsCount: 18,
    viewCount: 892,
    readingTime: 12,
    createdAt: '2024-01-14T14:20:00Z',
    publishedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    title: 'UI/UX 디자인 시스템 구축 가이드',
    excerpt: '일관성 있는 사용자 경험을 위한 디자인 시스템을 구축하고 유지하는 방법에 대해 알아봅시다.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    slug: 'design-system-guide',
    author: {
      id: '3',
      username: 'design_guru',
      name: '최디자인',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c00e7e6e?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: '3', name: 'Design', slug: 'design' },
    tags: [
      { id: '5', name: 'UI/UX', slug: 'ui-ux' },
      { id: '6', name: 'Figma', slug: 'figma' }
    ],
    likesCount: 123,
    commentsCount: 31,
    viewCount: 1456,
    readingTime: 6,
    createdAt: '2024-01-13T09:15:00Z',
    publishedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    title: 'React 18의 새로운 기능들 완벽 정리',
    excerpt: 'React 18에서 추가된 Concurrent Features와 Suspense의 활용법을 자세히 알아봅시다.',
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop',
    slug: 'react-18-features',
    author: {
      id: '1',
      username: 'techblogger',
      name: '김개발',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: '1', name: 'Frontend', slug: 'frontend' },
    tags: [
      { id: '2', name: 'React', slug: 'react' },
      { id: '7', name: 'JavaScript', slug: 'javascript' }
    ],
    likesCount: 45,
    commentsCount: 12,
    viewCount: 678,
    readingTime: 10,
    createdAt: '2024-01-12T16:45:00Z',
    publishedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    title: 'Docker로 개발 환경 표준화하기',
    excerpt: 'Docker를 활용하여 팀 전체의 개발 환경을 일관되게 관리하는 방법과 베스트 프랙티스를 소개합니다.',
    coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=400&fit=crop',
    slug: 'docker-development-environment',
    author: {
      id: '4',
      username: 'devops_ninja',
      name: '이데브옵스',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: '4', name: 'DevOps', slug: 'devops' },
    tags: [
      { id: '8', name: 'Docker', slug: 'docker' },
      { id: '9', name: 'DevOps', slug: 'devops' }
    ],
    likesCount: 78,
    commentsCount: 19,
    viewCount: 943,
    readingTime: 15,
    createdAt: '2024-01-11T11:00:00Z',
    publishedAt: '2024-01-11T11:00:00Z'
  },
  {
    id: '6',
    title: 'JavaScript ES2023의 새로운 기능들',
    excerpt: 'ES2023에서 추가된 새로운 JavaScript 기능들과 실제 사용 예시를 살펴보겠습니다.',
    coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=400&fit=crop',
    slug: 'javascript-es2023-features',
    author: {
      id: '5',
      username: 'js_expert',
      name: '정자바스크립트',
      avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face'
    },
    category: { id: '1', name: 'Frontend', slug: 'frontend' },
    tags: [
      { id: '7', name: 'JavaScript', slug: 'javascript' },
      { id: '10', name: 'ES2023', slug: 'es2023' }
    ],
    likesCount: 34,
    commentsCount: 8,
    viewCount: 521,
    readingTime: 7,
    createdAt: '2024-01-10T13:30:00Z',
    publishedAt: '2024-01-10T13:30:00Z'
  }
]

const categories = [
  { id: 'all', name: '전체', count: mockPosts.length },
  { id: 'frontend', name: 'Frontend', count: 3 },
  { id: 'backend', name: 'Backend', count: 1 },
  { id: 'design', name: 'Design', count: 1 },
  { id: 'devops', name: 'DevOps', count: 1 }
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

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      post.category.slug === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
      case 'oldest':
        return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime()
      case 'popular':
        return b.viewCount - a.viewCount
      case 'likes':
        return b.likesCount - a.likesCount
      default:
        return 0
    }
  })

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              {mockPosts.length}개의 포스트가 기다리고 있습니다
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              모든 포스트
            </h1>
            
            <p className="text-xl mb-10 opacity-90 leading-relaxed max-w-2xl mx-auto">
              개발자들의 실무 경험과 최신 기술 트렌드를 한눈에 살펴보세요. 
              원하는 주제의 글을 빠르게 찾아볼 수 있습니다.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <Input
                  type="text"
                  placeholder="포스트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Category Filter */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {category.name}
                  <span className="ml-1 text-xs opacity-75">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="likes">좋아요순</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            {filteredPosts.length}개의 포스트 {searchQuery && `"${searchQuery}" 검색 결과`}
          </p>
        </div>

        {/* Posts Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden rounded-2xl h-full">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                        {post.category.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 mb-6 text-sm">
                      {post.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-700"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {post.author.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {post.readingTime}분 읽기
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likesCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.commentsCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden rounded-2xl">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-80 aspect-video md:aspect-auto overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                          {post.category.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-700"
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {post.author.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.readingTime}분 읽기
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likesCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.commentsCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.viewCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                다른 검색어를 시도해보거나 필터를 조정해보세요.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                variant="outline"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 rounded-xl"
            >
              더 많은 포스트 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}