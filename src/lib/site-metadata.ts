import type { Metadata, Viewport } from 'next'

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.oxploria.com'),
  applicationName: 'Oxploria',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
}

export const siteViewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#F6F3EA' }
