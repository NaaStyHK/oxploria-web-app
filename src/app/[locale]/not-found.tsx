'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Compass } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale } from '@/lib/i18n/config'
import { route } from '@/lib/routes'

export default function LocaleNotFound() {
  const params = useParams<{ locale?: string }>()
  const locale = params.locale && isLocale(params.locale) ? params.locale : 'en'
  const t = getDictionary(locale)
  return <main className="page-shell"><section className="section"><div className="container"><div className="empty-state"><Compass size={38}/><h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)' }}>{t.errors.notFoundTitle}</h1><p>{t.errors.notFoundBody}</p><Link className="button button-primary" href={route.home(locale)}>{t.errors.home}</Link></div></div></section></main>
}
