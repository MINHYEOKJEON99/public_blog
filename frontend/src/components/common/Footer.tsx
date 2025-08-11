import Link from 'next/link'
import { PenTool, Github, Twitter, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <PenTool className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Public Blog</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              사용자 친화적이고 성능이 우수한 모던 블로그 플랫폼입니다.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">빠른 링크</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/posts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  전체 포스트
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  카테고리
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  태그
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  소개
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">인기 카테고리</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/categories/technology"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  기술
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/lifestyle"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  라이프스타일
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/programming"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  프로그래밍
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/design"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  디자인
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">소셜 미디어</h4>
            <div className="flex space-x-4">
              <Link
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="mailto:contact@publicblog.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
            <div className="space-y-2 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors block"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors block"
              >
                이용약관
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Public Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}