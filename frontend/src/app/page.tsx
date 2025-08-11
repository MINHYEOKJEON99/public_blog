import { Layout } from '@/components/common/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowRight, BookOpen, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            모던하고 <span className="text-primary">우아한</span>
            <br />
            블로그 플랫폼
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            사용자 친화적인 인터페이스와 강력한 기능으로 
            당신의 이야기를 세상과 공유하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/posts">
                포스트 둘러보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/dashboard">글쓰기 시작하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 Public Blog인가요?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              현대적인 기술 스택과 사용자 경험에 집중한 블로그 플랫폼
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">마크다운 에디터</h3>
              <p className="text-muted-foreground">
                직관적인 마크다운 에디터로 
                손쉽게 아름다운 글을 작성하세요
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">실시간 분석</h3>
              <p className="text-muted-foreground">
                조회수, 좋아요, 댓글 등
                실시간으로 통계를 확인하세요
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">소셜 기능</h3>
              <p className="text-muted-foreground">
                댓글, 좋아요, 공유 기능으로
                독자와 소통하세요
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Posts Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">최근 포스트</h2>
            <Button variant="ghost" asChild>
              <Link href="/posts">
                전체보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for recent posts */}
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted"></div>
                <div className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    2024년 1월 {15 - i}일
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    샘플 포스트 제목 {i + 1}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    이것은 샘플 포스트의 요약입니다. 
                    실제 데이터가 연결되면 실제 내용이 표시됩니다.
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">
                      작성자명
                    </span>
                    <span className="text-xs text-muted-foreground">
                      5분 읽기
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 시작해보세요
          </h2>
          <p className="text-lg mb-8 opacity-90">
            무료로 가입하고 당신만의 블로그를 만들어보세요
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              무료로 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  )
}
