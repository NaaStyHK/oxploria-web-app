'use client'

import { useEffect } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { writeLocalePreference } from '@/lib/browser-storage'

export function LocaleDocument({ locale }: { locale: Locale }) {
  useEffect(() => {
    writeLocalePreference(locale)
  }, [locale])
  return null
}
