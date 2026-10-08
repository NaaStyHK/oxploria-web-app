'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale } from '@/lib/i18n/config'
import { route } from '@/lib/routes'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>()
  const locale = params.locale && isLocale(params.locale) ? params.locale : 'en'
  const t = getDictionary(locale)
  return <main className="page-shell"><section className="section"><div className="container"><div className="empty-state"><AlertTriangle size={36}/><h1 className="error-title">{t.errors.title}</h1><p>{t.errors.body}</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={reset}>{t.errors.retry}</button><Link className="button button-light" href={route.home(locale)}>{t.errors.home}</Link></div></div></div></section></main>
}
