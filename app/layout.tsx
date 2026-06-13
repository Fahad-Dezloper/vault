import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { ServiceWorker } from '@/components/ServiceWorker'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'xStocks',
  description: 'Track tokenized stocks on Solana via Jupiter',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'xStocks',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-white text-black antialiased min-h-svh max-w-md mx-auto">
        <ServiceWorker />
        {children}
      </body>
    </html>
  )
}
