'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { PlaceSummary } from '@/lib/types'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { matchesPlace, nextSearchResultsLimit, SEARCH_RESULTS_BATCH_SIZE, visibleSearchResults } from '@/lib/search'
import { EmptyState } from '@/components/empty-state'
import { PlaceCard } from '@/components/place-card'
import { track } from '@/lib/analytics'

export function SearchExperience({ locale, places }: { locale: Locale; places: PlaceSummary[] }) {
  const t = getDictionary(locale)
  const [query, setQuery] = useState('')
  const [visibility, setVisibility] = useState({ key: '', limit: SEARCH_RESULTS_BATCH_SIZE })
  const results = useMemo(() => query.trim() ? places.filter((place) => matchesPlace(place, query)) : [], [places, query])
  const visibilityKey = query.trim().toLocaleLowerCase(locale)
  const visibleLimit = visibility.key === visibilityKey ? visibility.limit : SEARCH_RESULTS_BATCH_SIZE
  const visibleResults = visibleSearchResults(results, visibleLimit)
  const suggestions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const place of places) counts.set(place.categoryName, (counts.get(place.categoryName) ?? 0) + 1)
    return [...counts].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label]) => label)
  }, [places])
  const chooseSuggestion = (suggestion: string) => {
    setQuery(suggestion)
    track('search_performed', { queryLength: suggestion.length, source: 'suggestion' })
  }
  return <div className="search-shell"><label className="search-form"><span className="sr-only">{t.search.placeholder}</span><input className="search-input" autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); track('search_performed', { queryLength: event.target.value.length }) }} placeholder={t.search.placeholder}/><Search className="search-icon" size={24} aria-hidden="true" /></label>
    <div className="search-suggestions"><h2>{t.search.suggestions}</h2><div className="search-suggestion-list">{suggestions.map((suggestion) => <button key={suggestion} type="button" className="chip" onClick={() => chooseSuggestion(suggestion)}>{suggestion}</button>)}</div></div>
    <div aria-live="polite" className="muted search-results-count">{query.trim() ? `${results.length} ${results.length === 1 ? t.common.result : t.common.results}` : ''}</div>
    {query.trim() ? results.length ? <><div className="results-grid">{visibleResults.map((place) => <PlaceCard key={place.id} place={place} locale={locale}/>)}</div>{visibleLimit < results.length && <div className="directory-more"><button type="button" className="button button-dark" onClick={() => setVisibility({ key: visibilityKey, limit: nextSearchResultsLimit(visibleLimit, results.length) })}>{t.common.showMore}</button></div>}</> : <div className="search-empty"><EmptyState title={t.search.empty} body={t.search.emptyHelp} action={<button type="button" className="button button-light search-reset" onClick={() => setQuery('')}>{t.search.reset}</button>}/></div> : <p className="search-initial muted">{t.search.initial}</p>}
  </div>
}
