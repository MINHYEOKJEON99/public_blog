'use client'

import { useState } from 'react'
import { Layout } from '@/components/common/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Heart, MessageCircle, Eye, ArrowRight, BookOpen, Users, Zap } from 'lucide-react'

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    title: 'Next.js 13과 App Router로 현대적인 웹 앱 개발하기',
    excerpt: 'Next.js 13에서 도입된 App Router의 새로운 기능들과 실제 프로젝트에 적용하는 방법을 알아보겠습니다.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
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
    likesCount: 24,
    commentsCount: 12,
    viewCount: 156,
    readingTime: 8,
    createdAt: '2024-01-15T10:30:00Z',
    publishedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'TypeScript로 안전한 백엔드 API 구축하기',
    excerpt: 'Express.js와 TypeScript를 함께 사용하여 타입 안전한 RESTful API를 만드는 방법과 모범 사례를 소개합니다.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
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
    likesCount: 32,
    commentsCount: 8,
    viewCount: 203,
    readingTime: 12,
    createdAt: '2024-01-14T14:20:00Z',
    publishedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    title: 'UI/UX 디자인 시스템 구축 가이드',
    excerpt: '일관성 있는 사용자 경험을 위한 디자인 시스템을 구축하고 유지하는 방법에 대해 알아봅시다.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
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
    likesCount: 45,
    commentsCount: 15,
    viewCount: 298,
    readingTime: 6,
    createdAt: '2024-01-13T09:15:00Z',
    publishedAt: '2024-01-13T09:15:00Z'
  }
]

const mockCategories = [
  { id: '1', name: 'Frontend', slug: 'frontend', postsCount: 24 },
  { id: '2', name: 'Backend', slug: 'backend', postsCount: 18 },
  { id: '3', name: 'Design', slug: 'design', postsCount: 12 },
  { id: '4', name: 'DevOps', slug: 'devops', postsCount: 8 }
]

const mockTags = [
  { id: '1', name: 'React', slug: 'react', postsCount: 15 },
  { id: '2', name: 'TypeScript', slug: 'typescript', postsCount: 12 },
  { id: '3', name: 'Next.js', slug: 'nextjs', postsCount: 10 },
  { id: '4', name: 'Node.js', slug: 'nodejs', postsCount: 8 },
  { id: '5', name: 'UI/UX', slug: 'ui-ux', postsCount: 6 }
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10" />
        <div className="relative container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            개발자를 위한 지식 공유 플랫폼
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            함께 성장하는
            <br />
            개발자 커뮤니티
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            최신 기술 트렌드부터 실무 노하우까지, 
            개발자들이 서로의 경험과 지식을 나누며 함께 성장하는 공간입니다.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="궁금한 주제를 검색해보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-8 rounded-xl" asChild>
              <Link href="/posts">
                모든 포스트 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2" asChild>
              <Link href="/login">지금 시작하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">트렌딩 포스트</h2>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mockPosts.map((post, index) => (
              <Card key={post.id} className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden rounded-2xl ${index === 0 ? 'md:col-span-2 md:row-span-1' : ''}`}>
                <div className={`aspect-video overflow-hidden ${index === 0 ? 'md:aspect-[2/1]' : ''}`}>
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                      {post.category?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  <CardTitle className={`line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors ${index === 0 ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className={`line-clamp-3 mb-6 ${index === 0 ? 'text-base' : 'text-sm'}`}>
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
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-xl px-8" asChild>
              <Link href="/posts">
                더 많은 포스트 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 Public Blog인가요?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              현대적인 기술 스택과 개발자 친화적인 기능으로 최고의 경험을 제공합니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-4 bg-blue-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">마크다운 에디터</h3>
              <p className="text-muted-foreground">
                직관적인 마크다운 에디터로 
                손쉽게 아름다운 글을 작성하세요
              </p>
            </Card>
            
            <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-4 bg-purple-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">실시간 분석</h3>
              <p className="text-muted-foreground">
                조회수, 좋아요, 댓글 등
                실시간으로 통계를 확인하세요
              </p>
            </Card>
            
            <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-4 bg-pink-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">소셜 기능</h3>
              <p className="text-muted-foreground">
                댓글, 좋아요, 공유 기능으로
                독자와 소통하세요
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories & Tags */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Categories */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">인기 카테고리</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockCategories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`}>
                    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.postsCount}개의 포스트
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">인기 태그</h2>
              <div className="flex flex-wrap gap-3">
                {mockTags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg">
                      #{tag.name}
                      <span className="text-xs text-muted-foreground bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded-full">
                        {tag.postsCount}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">함께 성장하는 개발자 커뮤니티</h2>
          <p className="text-lg text-muted-foreground mb-12">매일 새로운 지식이 공유되고, 개발자들이 함께 성장하고 있습니다</p>
          
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">1,200+</div>
              <div className="text-muted-foreground font-medium">등록된 포스트</div>
            </div>
            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">350+</div>
              <div className="text-muted-foreground font-medium">활동 중인 개발자</div>
            </div>
            <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent mb-2">5,600+</div>
              <div className="text-muted-foreground font-medium">공유된 지식</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            무료로 가입하고 개발자 커뮤니티의 일원이 되어 
            당신의 지식을 공유하고 새로운 것을 배워보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-12 px-8 rounded-xl bg-white text-blue-600 hover:bg-gray-100 font-medium" asChild>
              <Link href="/register">
                무료로 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-2 border-white text-white hover:bg-white/10 font-medium" asChild>
              <Link href="/posts">둘러보기</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
