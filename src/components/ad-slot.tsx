import type { Locale } from '@/lib/i18n/config'

const labels: Record<Locale, { name: string; placeholder: string }> = {
  fr: { name: 'Publicité', placeholder: 'emplacement de développement' },
  es: { name: 'Publicidad', placeholder: 'espacio de desarrollo' },
  en: { name: 'Advertising', placeholder: 'development placeholder' },
}

export function AdSlot({ locale }: { locale: Locale }) {
  if (process.env.NODE_ENV !== 'development') return null
  const label = labels[locale] ?? labels.en
  return <aside aria-label={label.name} style={{ padding: '1rem', border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius)', color: 'var(--muted)', textAlign: 'center', fontSize: '.8rem' }}>{label.name} · {label.placeholder}</aside>
}
