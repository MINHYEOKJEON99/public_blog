'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Layout } from '@/components/common/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { 
  Heart, MessageCircle, Eye, Share2, Clock, Calendar,
  User, ArrowUp, Bookmark, ThumbsUp, Reply, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - 실제로는 API에서 가져올 데이터
const mockPost = {
  id: '1',
  title: 'Next.js 13과 App Router로 현대적인 웹 앱 개발하기',
  content: `
# Next.js 13 App Router 완벽 가이드

Next.js 13에서 도입된 **App Router**는 React 18의 최신 기능들을 활용하여 더욱 강력하고 유연한 라우팅 시스템을 제공합니다. 이 글에서는 App Router의 핵심 개념과 실제 프로젝트에 적용하는 방법을 자세히 알아보겠습니다.

## 1. App Router란?

App Router는 Next.js 13에서 새롭게 도입된 라우팅 시스템으로, React Server Components를 기본으로 합니다. 기존의 Pages Router와 비교하여 다음과 같은 장점을 가지고 있습니다.

### 주요 특징

- **Server Components**: 서버에서 렌더링되는 컴포넌트로 번들 크기 최소화
- **Nested Layouts**: 중첩된 레이아웃을 쉽게 구현
- **Loading UI**: 로딩 상태를 선언적으로 처리
- **Error Boundaries**: 에러 처리를 컴포넌트 레벨에서 관리

## 2. 파일 기반 라우팅

\`\`\`
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── about/
│   └── page.tsx       # About page
└── blog/
    ├── layout.tsx     # Blog layout
    ├── page.tsx       # Blog list
    └── [slug]/
        └── page.tsx   # Blog post
\`\`\`

## 3. 실제 구현 예시

다음은 블로그 포스트 페이지를 구현하는 예시입니다.

\`\`\`tsx
// app/blog/[slug]/page.tsx
interface Props {
  params: { slug: string }
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
\`\`\`

## 4. 성능 최적화

App Router를 사용하면 다음과 같은 성능 최적화를 자동으로 얻을 수 있습니다.

- **자동 코드 분할**: 페이지별로 자동으로 번들이 분할됩니다.
- **Prefetching**: Link 컴포넌트가 뷰포트에 나타나면 자동으로 프리페치됩니다.
- **캐싱**: 서버 컴포넌트의 결과가 자동으로 캐싱됩니다.

## 마무리

Next.js 13의 App Router는 현대적인 웹 개발의 새로운 패러다임을 제시합니다. Server Components와 함께 사용하면 더욱 빠르고 효율적인 웹 애플리케이션을 만들 수 있습니다.

다음 글에서는 App Router의 고급 기능들을 더 자세히 살펴보겠습니다. 궁금한 점이 있다면 댓글로 남겨주세요!
`,
  excerpt: 'Next.js 13에서 도입된 App Router의 새로운 기능들과 실제 프로젝트에 적용하는 방법을 알아보겠습니다.',
  coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
  slug: 'nextjs-13-app-router',
  published: true,
  viewCount: 1247,
  author: {
    id: '1',
    username: 'techblogger',
    name: '김개발',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    bio: '프론트엔드 개발자. React와 Next.js를 주로 사용합니다.'
  },
  category: { id: '1', name: 'Frontend', slug: 'frontend' },
  tags: [
    { id: '1', name: 'Next.js', slug: 'nextjs' },
    { id: '2', name: 'React', slug: 'react' },
    { id: '3', name: 'App Router', slug: 'app-router' }
  ],
  likesCount: 89,
  commentsCount: 24,
  isLiked: false,
  readingTime: 8,
  createdAt: '2024-01-15T10:30:00Z',
  publishedAt: '2024-01-15T10:30:00Z'
}

const mockComments = [
  {
    id: '1',
    content: '정말 유용한 글이네요! App Router를 처음 사용해보는데 이해가 잘 됐습니다.',
    author: {
      id: '2',
      name: '박개발자',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
    },
    createdAt: '2024-01-15T12:30:00Z',
    likesCount: 12,
    replies: [
      {
        id: '2',
        content: '감사합니다! 도움이 되었다니 기쁘네요 😊',
        author: {
          id: '1',
          name: '김개발',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
        },
        createdAt: '2024-01-15T13:00:00Z',
        likesCount: 5
      }
    ]
  },
  {
    id: '3',
    content: 'Server Components에 대해서도 더 자세한 글 써주시면 좋겠어요!',
    author: {
      id: '3',
      name: '최프론트',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c00e7e6e?w=50&h=50&fit=crop&crop=face'
    },
    createdAt: '2024-01-15T14:15:00Z',
    likesCount: 8,
    replies: []
  }
]

const mockRelatedPosts = [
  {
    id: '2',
    title: 'React 18의 새로운 기능들 완벽 정리',
    excerpt: 'React 18에서 추가된 Concurrent Features와 Suspense의 활용법을 알아봅시다.',
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=200&fit=crop',
    slug: 'react-18-new-features',
    readingTime: 6
  },
  {
    id: '3',
    title: 'TypeScript와 React로 타입 안전한 컴포넌트 만들기',
    excerpt: 'TypeScript의 고급 타입을 활용하여 재사용 가능한 React 컴포넌트를 만드는 방법을 소개합니다.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
    slug: 'typescript-react-components',
    readingTime: 10
  }
]

export default function PostPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams<{ slug: string }>()
  const [isLiked, setIsLiked] = useState(mockPost.isLiked)
  const [likesCount, setLikesCount] = useState(mockPost.likesCount)
  const [commentText, setCommentText] = useState('')
  // const [showScrollTop, setShowScrollTop] = useState(false) // TODO: Implement scroll to top functionality

  // Mock post fetching - 실제로는 API 호출
  const post = mockPost
  if (!post) {
    notFound()
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative">
        <div className="aspect-[21/9] lg:aspect-[21/7] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                <Link href="/" className="hover:text-white transition-colors">홈</Link>
                <span>/</span>
                <Link href="/posts" className="hover:text-white transition-colors">포스트</Link>
                <span>/</span>
                <Link 
                  href={`/category/${post.category.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {post.category.name}
                </Link>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full ring-2 ring-white/20"
                  />
                  <div>
                    <div className="font-medium">{post.author.name}</div>
                    <div className="text-sm text-white/70">@{post.author.username}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime}분 읽기
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount.toLocaleString()} 조회
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/30 transition-colors">
                      #{tag.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              {/* Article Content */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 lg:p-12">
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} 
                />
              </div>

              {/* Article Actions */}
              <div className="flex items-center justify-between py-8 border-b dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={handleLike}
                    className={cn(
                      "flex items-center gap-2",
                      isLiked && "bg-red-500 hover:bg-red-600 text-white"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                    {likesCount}
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {post.commentsCount}
                  </Button>
                  
                  <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    공유
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Author Info */}
              <Card className="my-12">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{post.author.name}</h3>
                      <p className="text-muted-foreground mb-4">{post.author.bio}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">팔로우</Button>
                        <Button variant="ghost" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          프로필 보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <section className="my-12">
                <h2 className="text-2xl font-bold mb-8">댓글 {post.commentsCount}개</h2>
                
                {/* Comment Form */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">댓글 작성</h3>
                    <div className="space-y-4">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="의견을 남겨주세요..."
                        className="min-h-[120px]"
                      />
                      <div className="flex justify-end">
                        <Button disabled={!commentText.trim()}>
                          댓글 등록
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-6">
                  {mockComments.map((comment) => (
                    <Card key={comment.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">{comment.author.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {comment.likesCount}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Reply className="h-3 w-3 mr-1" />
                                답글
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-3">
                                    <img
                                      src={reply.author.avatar}
                                      alt={reply.author.name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{reply.author.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        {reply.content}
                                      </p>
                                      <Button variant="ghost" size="sm" className="text-xs">
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        {reply.likesCount}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </article>
          </main>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Table of Contents */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">목차</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2 text-sm">
                  <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors">
                    1. App Router란?
                  </a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                    2. 파일 기반 라우팅
                  </a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                    3. 실제 구현 예시
                  </a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                    4. 성능 최적화
                  </a>
                </nav>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">관련 포스트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRelatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/posts/${relatedPost.slug}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          src={relatedPost.coverImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {relatedPost.readingTime}분 읽기
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50"
        size="sm"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </Layout>
  )
}