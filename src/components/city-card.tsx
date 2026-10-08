import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { City } from '@/lib/types'
import { route } from '@/lib/routes'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { SafeImage } from '@/components/safe-image'

export function CityCard({ city, locale, count }: { city: City; locale: Locale; count: number }) {
  const t = getDictionary(locale)
  return <Link className="city-card" href={route.city(locale, city.slug)}><SafeImage src={city.image} alt="" fill sizes="(max-width: 639px) 100vw, 50vw" fallbackLabel={t.places.photoUnavailable} /><div className="city-card-copy"><span className="mono">{city.country} · {count} {t.city.places}</span><h3>{city.name}</h3><p>{city.description}</p><div className="city-card-meta"><strong>{t.home.openCity}</strong><ArrowUpRight size={25} aria-hidden="true" /></div></div></Link>
}
