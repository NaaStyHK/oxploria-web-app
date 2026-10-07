import '../globals.css'
import { siteMetadata, siteViewport } from '@/lib/site-metadata'

export const metadata = siteMetadata
export const viewport = siteViewport

export default function RootLandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>
}
