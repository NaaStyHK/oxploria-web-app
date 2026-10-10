import { describe, expect, it } from 'vitest'
import { locales } from '@/lib/i18n/config'
import { getLegalDocument } from '@/lib/legal-content'
import { legalConfig } from '@/lib/legal-config'

describe('localized legal documents', () => {
  it('provides every public legal document in every locale', () => {
    for (const locale of locales) for (const page of ['legal', 'privacy', 'cookies', 'terms'] as const) {
      const document = getLegalDocument(locale, page)
      expect(document.description.length).toBeGreaterThan(25)
      expect(document.updatedLabel).toContain('2026')
      expect(document.sections.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('keeps verified and missing publisher facts explicit', () => {
    expect(legalConfig.operatorName).toBe('Kevin Hafsi')
    expect(legalConfig.siret).toBe('10181386300012')
    expect(legalConfig.publisherAddress).toBeNull()
    expect(legalConfig.publisherPhone).toBeNull()
  })

  it('documents every browser storage key', () => {
    const text = JSON.stringify(getLegalDocument('fr', 'cookies'))
    for (const key of ['oxploria-locale', 'oxploria-active-city', 'oxploria-favourites', 'oxploria-pending-location']) expect(text).toContain(key)
  })

  it('uses the intended public domain in legal records', () => {
    expect(legalConfig.publicSiteUrl).toBe('https://www.oxploria.com')
  })
})
