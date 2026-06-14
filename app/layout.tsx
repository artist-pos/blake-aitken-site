import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: {
    default: 'Blake Aitken — Public Artist & Architectural Designer',
    template: '%s — Blake Aitken',
  },
  description:
    'Blake Aitken is a public artist and architectural designer based in Kirikiriroa (Hamilton), Aotearoa New Zealand.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blakeaitken.com'),
  openGraph: {
    siteName: 'Blake Aitken',
    locale: 'en_NZ',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-NZ" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
