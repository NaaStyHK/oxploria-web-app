import { describe, expect, it } from 'vitest'
import { nextSearchResultsLimit, SEARCH_RESULTS_BATCH_SIZE, visibleSearchResults } from '@/lib/search'

describe('search result pagination', () => {
  it.each([0, 1, 23, 24])('renders all %i results when they fit in one batch', (total) => {
    const results = Array.from({ length: total }, (_, index) => index)
    expect(visibleSearchResults(results, SEARCH_RESULTS_BATCH_SIZE)).toHaveLength(total)
    expect(nextSearchResultsLimit(SEARCH_RESULTS_BATCH_SIZE, total)).toBe(total)
  })

  it('renders 24 of 25 results first, then exposes the final result', () => {
    const results = Array.from({ length: 25 }, (_, index) => index)
    expect(visibleSearchResults(results, SEARCH_RESULTS_BATCH_SIZE)).toHaveLength(24)
    const nextLimit = nextSearchResultsLimit(SEARCH_RESULTS_BATCH_SIZE, results.length)
    expect(nextLimit).toBe(25)
    expect(visibleSearchResults(results, nextLimit)).toHaveLength(25)
  })

  it('progresses by batches without rendering hundreds of cards immediately', () => {
    const results = Array.from({ length: 296 }, (_, index) => index)
    expect(visibleSearchResults(results, SEARCH_RESULTS_BATCH_SIZE)).toHaveLength(24)
    expect(nextSearchResultsLimit(24, results.length)).toBe(48)
    expect(nextSearchResultsLimit(288, results.length)).toBe(296)
  })
})
