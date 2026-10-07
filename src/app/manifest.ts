import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return { name: 'Oxploria', short_name: 'Oxploria', description: 'Explore what is around you.', start_url: '/en', display: 'standalone', background_color: '#F6F3EA', theme_color: '#FFD400', icons: [{ src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] }
}
