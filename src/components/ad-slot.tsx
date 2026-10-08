import type { Locale } from '@/lib/i18n/config'

const labels: Record<Locale, { name: string; placeholder: string }> = {
  fr: { name: 'Publicité', placeholder: 'emplacement de développement' },
  es: { name: 'Publicidad', placeholder: 'espacio de desarrollo' },
  en: { name: 'Advertising', placeholder: 'development placeholder' },
}

export function AdSlot({ locale }: { locale: Locale }) {
  if (process.env.NODE_ENV !== 'development') return null
  const label = labels[locale] ?? labels.en
  return <aside className="ad-slot" aria-label={label.name}>{label.name} · {label.placeholder}</aside>
}
