'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Place } from '@/lib/types'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { matchesPlace } from '@/lib/search'
import { EmptyState } from '@/components/empty-state'
import { PlaceCard } from '@/components/place-card'
import { track } from '@/lib/analytics'

export function SearchExperience({ locale, places }: { locale: Locale; places: Place[] }) {
  const t = getDictionary(locale)
  const [query, setQuery] = useState('')
  const results = useMemo(() => query.trim() ? places.filter((place) => matchesPlace(place, query)).slice(0, 24) : [], [places, query])
  return <div className="search-shell"><label className="search-form"><span className="sr-only">{t.search.placeholder}</span><input className="search-input" autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); track('search_performed', { queryLength: event.target.value.length }) }} placeholder={t.search.placeholder}/><Search className="search-icon" size={24} aria-hidden="true" /></label>
    <div aria-live="polite" className="muted search-results-count">{query.trim() ? `${results.length} ${results.length === 1 ? t.common.result : t.common.results}` : ''}</div>
    {query.trim() ? results.length ? <div className="results-grid">{results.map((place) => <PlaceCard key={place.id} place={place} locale={locale}/>)}</div> : <div className="search-empty"><EmptyState title={t.search.empty} body={t.search.emptyHelp}/></div> : <div className="search-empty"><EmptyState title={t.search.initial} body={t.search.description}/></div>}
  </div>
}
