'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { track } from '@/lib/analytics'
import { writeLocalePreference } from '@/lib/browser-storage'
import { translatePathname } from '@/lib/route-translation'
import { metadataAlternatePath, useMetadataAlternateLinks } from '@/lib/localized-links'

export function FooterLanguageLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)
  useMetadataAlternateLinks(rootRef, pathname)
  return <div className="footer-languages" ref={rootRef}>
    {locales.map((target) => <Link
      key={target}
      href={translatePathname(pathname, target)}
      hrefLang={target}
      lang={target}
      data-locale-target={target}
      prefetch={false}
      aria-current={target === locale ? 'page' : undefined}
      onClick={(event) => { const alternate = metadataAlternatePath(target); if (alternate && alternate !== event.currentTarget.getAttribute('href')) { event.preventDefault(); window.location.assign(alternate) } writeLocalePreference(target); track('language_changed', { from: locale, to: target }) }}
    ><span>{getDictionary(target).localeName}</span><span className="mono">{target.toUpperCase()}</span></Link>)}
  </div>
}
