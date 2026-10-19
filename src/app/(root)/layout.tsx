import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import '../globals.css'
import { siteMetadata, siteViewport } from '@/lib/site-metadata'

export const metadata = siteMetadata
export const viewport = siteViewport

export default function RootLandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><head><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4020415320847522" crossOrigin="anonymous" strategy="beforeInteractive" /></head><body>{children}<Analytics /></body></html>
}
