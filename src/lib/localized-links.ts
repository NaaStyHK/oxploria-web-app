'use client'

import { useEffect, type RefObject } from 'react'
import { locales, type Locale } from '@/lib/i18n/config'

export function metadataAlternatePath(locale: Locale): string | null {
  if (typeof document === 'undefined') return null
  const href = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${locale}"]`)?.href
  if (!href) return null
  try {
    const url = new URL(href)
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function useMetadataAlternateLinks(root: RefObject<HTMLElement | null>, pathname: string, active = true) {
  useEffect(() => {
    if (!active || !root.current) return
    for (const locale of locales) {
      const path = metadataAlternatePath(locale)
      if (path) root.current.querySelector<HTMLAnchorElement>(`a[data-locale-target="${locale}"]`)?.setAttribute('href', path)
    }
  }, [active, pathname, root])
}
