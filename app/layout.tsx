import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoyalDrive Mobility',
  description: 'Fleet & Reservation Management',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={geist.className} suppressHydrationWarning>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  )
}