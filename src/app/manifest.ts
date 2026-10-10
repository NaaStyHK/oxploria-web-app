import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oxploria — Interactive travel guide',
    short_name: 'Oxploria',
    description: 'Explore Barcelona and La Rochelle through cultural places, maps and walking guides.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F3EA',
    theme_color: '#FFD400',
    icons: [
      { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
