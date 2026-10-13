import { ExternalLink } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'

const barcelonaSources = [
  { key: 'barcelonaCouncil', href: 'https://www.barcelona.cat/' },
  { key: 'barcelonaArchives', href: 'https://ajuntament.barcelona.cat/arxiumunicipal/' },
  { key: 'cataloniaHeritage', href: 'https://patrimoni.gencat.cat/' },
  { key: 'officialInstitution' },
  { key: 'poblesCatalunya', href: 'https://www.poblesdecatalunya.cat/' },
] as const

export function PlaceEditorialSources({ locale, cityId }: { locale: Locale; cityId: string }) {
  const labels = getDictionary(locale).places.editorialSources
  const isBarcelona = cityId === 'barcelona'

  return <section className="place-sources-section" aria-labelledby="place-sources-title">
    <div className="container editorial-sources">
      <div className="editorial-sources-heading">
        <h2 id="place-sources-title">{labels.title}</h2>
        <p><strong>{labels.authorLabel}</strong> Oxploria</p>
      </div>
      <div className="editorial-sources-content">
        <p>{labels.intro}</p>
        {isBarcelona && <>
          <p>{labels.barcelonaIntro}</p>
          <ul>{barcelonaSources.map((source) => <li key={source.key}>
            {'href' in source ? <a href={source.href} target="_blank" rel="noreferrer">{labels[source.key]}<ExternalLink size={14} aria-hidden="true" /></a> : labels[source.key]}
          </li>)}</ul>
        </>}
      </div>
    </div>
  </section>
}
