import { describe, expect, it } from 'vitest'
import { locales } from '@/lib/i18n/config'
import { getLegalDocument } from '@/lib/legal-content'
import { legalConfig } from '@/lib/legal-config'
import { queueGooglePrivacySettings } from '@/components/privacy-settings-button'

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
    for (const key of ['oxploria-locale', 'oxploria-active-city', 'oxploria-favourites', 'oxploria-session-location']) expect(text).toContain(key)
  })

  it('documents AdSense and Google consent choices in every locale', () => {
    for (const locale of locales) {
      const privacy = JSON.stringify(getLegalDocument(locale, 'privacy'))
      const cookies = JSON.stringify(getLegalDocument(locale, 'cookies'))
      expect(privacy).toContain('Google AdSense')
      expect(cookies).toContain('Google AdSense')
      expect(cookies).toContain('https://support.google.com/adsense/answer/10961068')
    }
  })

  it('queues Google privacy settings before and after the API is ready', () => {
    const readyCalls: string[] = []
    const ready = { callbackQueue: [] as Array<() => void>, showRevocationMessage: () => readyCalls.push('opened') }
    queueGooglePrivacySettings(ready)
    expect(ready.callbackQueue).toHaveLength(1)
    ready.callbackQueue[0]()
    expect(readyCalls).toEqual(['opened'])

    const delayed: { callbackQueue?: Array<() => void>; showRevocationMessage?: () => void } = {}
    queueGooglePrivacySettings(delayed)
    expect(delayed.callbackQueue).toHaveLength(1)
    delayed.showRevocationMessage = () => readyCalls.push('opened-later')
    delayed.callbackQueue?.[0]()
    expect(readyCalls).toContain('opened-later')
  })

  it('uses the intended public domain in legal records', () => {
    expect(legalConfig.publicSiteUrl).toBe('https://www.oxploria.com')
  })
})
