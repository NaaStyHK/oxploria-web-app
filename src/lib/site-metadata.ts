import type { Metadata, Viewport } from 'next'
import { siteUrlFromEnvironment } from '@/lib/site-url'

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrlFromEnvironment()),
  applicationName: 'Oxploria',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
}

export const siteViewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#F6F3EA' }
