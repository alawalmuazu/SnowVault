import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'eERC Dashboard - Private DeFi on Avalanche',
  description: 'Experience the future of private DeFi with encrypted ERC-20 tokens on Avalanche. Secure, private, and lightning-fast transactions.',
  keywords: [
    'DeFi',
    'Privacy',
    'Avalanche',
    'Encrypted',
    'ERC-20',
    'Blockchain',
    'Cryptocurrency',
    'Private Transactions',
    'eERC',
    'Lending',
    'Payroll',
    'DAO',
    'RWA'
  ],
  authors: [{ name: 'eERC Team' }],
  creator: 'eERC Team',
  publisher: 'eERC Team',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eerc.avalabs.org',
    title: 'eERC Dashboard - Private DeFi on Avalanche',
    description: 'Experience the future of private DeFi with encrypted ERC-20 tokens on Avalanche.',
    siteName: 'eERC Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eERC Dashboard - Private DeFi on Avalanche',
    description: 'Experience the future of private DeFi with encrypted ERC-20 tokens on Avalanche.',
    creator: '@avalabsofficial',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}