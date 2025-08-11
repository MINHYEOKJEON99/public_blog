import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/common/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Public Blog',
    default: 'Public Blog - 모던 블로그 플랫폼',
  },
  description: '사용자 친화적이고 성능이 우수한 블로그 플랫폼',
  keywords: ['블로그', '포스트', '글쓰기', 'Next.js', 'TypeScript'],
  authors: [{ name: 'Public Blog' }],
  creator: 'Public Blog',
  publisher: 'Public Blog',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    title: 'Public Blog',
    description: '사용자 친화적이고 성능이 우수한 블로그 플랫폼',
    siteName: 'Public Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Blog',
    description: '사용자 친화적이고 성능이 우수한 블로그 플랫폼',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
