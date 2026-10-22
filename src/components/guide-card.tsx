import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Guide, City } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { route } from '@/lib/routes'
import { EditorialImage } from '@/components/editorial-image'

export function GuideCard({ guide, city, locale }: { guide: Guide; city: City; locale: Locale }) {
  const t = getDictionary(locale)
  return <article className="city-card guide-card"><EditorialImage src={guide.image} fallbackLabel={t.places.photoUnavailable} /><div className="city-card-copy"><span className="mono">{guide.readMinutes} {t.common.minutes}</span><h3>{guide.title}</h3><div className="city-card-meta"><span>{city.name}</span><ArrowUpRight size={24} aria-hidden="true" /></div></div><Link className="place-card-link" href={route.guide(locale, city.slug, guide.slug)}><span className="sr-only">{t.common.readMore}: {guide.title}</span></Link></article>
}
