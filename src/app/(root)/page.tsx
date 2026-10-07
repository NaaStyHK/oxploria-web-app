'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Compass } from 'lucide-react'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { readLocalePreference } from '@/lib/browser-storage'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    const stored = readLocalePreference()
    const browserLocale = (navigator.languages.length ? navigator.languages : [navigator.language]).map((language) => language.toLowerCase().split('-')[0]).find(isLocale)
    const locale: Locale = stored ?? browserLocale ?? 'en'
    router.replace(`/${locale}`)
  }, [router])
  return <main className="locale-restore" aria-live="polite" aria-busy="true"><Compass size={34} className="spin" aria-hidden="true"/><strong>Oxploria</strong><span>Loading · Chargement · Cargando</span></main>
}
