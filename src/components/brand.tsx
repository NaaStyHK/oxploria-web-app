import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { route } from '@/lib/routes'

export function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 36" aria-hidden="true">
      <path d="M16 1.5C8.8 1.5 3 7.3 3 14.5 3 23 16 34.5 16 34.5S29 23 29 14.5C29 7.3 23.2 1.5 16 1.5Z" fill="#FFD400" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="14.5" r="7" fill="#fff" stroke="currentColor" strokeWidth="1.3" />
      <path d="m16 8.5 2.25 6L16 20.5l-2.25-6L16 8.5Z" fill="currentColor" />
      <circle cx="16" cy="14.5" r="1" fill="#FFD400" />
    </svg>
  )
}

export function Brand({ locale, inverse = false }: { locale: Locale; inverse?: boolean }) {
  return <Link href={route.home(locale)} className="brand" style={{ color: inverse ? '#fff' : undefined }} aria-label="Oxploria"><span>Oxpl</span><BrandMark /><span>ria</span></Link>
}
