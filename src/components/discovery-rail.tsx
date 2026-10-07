import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { PlaceCard } from '@/components/place-card'
import type { Locale } from '@/lib/i18n/config'
import type { Place } from '@/lib/types'

type DiscoveryItem = { place: Place; distance?: string }

export function DiscoveryRail({
  locale,
  title,
  body,
  items,
  action,
  tone = 'paper',
  className = '',
  headingControl,
}: {
  locale: Locale
  title: string
  body: string
  items: DiscoveryItem[]
  action?: { href: string; label: string }
  tone?: 'paper' | 'yellow' | 'dark'
  className?: string
  headingControl?: ReactNode
}) {
  if (items.length === 0) return null

  return <section className={`discovery-section discovery-section-${tone} ${className}`.trim()}>
    <div className="container">
      <div className="discovery-heading">
        <div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        {headingControl ?? (action && <Link className="discovery-action" href={action.href}>{action.label}<ArrowRight size={17} aria-hidden="true" /></Link>)}
      </div>
      <div className="discovery-rail">
        {items.map(({ place, distance }) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} distance={distance} />)}
      </div>
    </div>
  </section>
}
