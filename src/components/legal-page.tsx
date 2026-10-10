import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { legalConfig } from '@/lib/legal-config'
import { route } from '@/lib/routes'

type LegalKey = 'about' | 'contact' | 'privacy' | 'cookies' | 'legal' | 'terms'

export function LegalPage({ locale, page }: { locale: Locale; page: LegalKey }) {
  const t = getDictionary(locale)
  const content = {
    about: [t.legal.aboutTitle, t.legal.aboutBody], contact: [t.legal.contactTitle, t.legal.contactBody], privacy: [t.legal.privacyTitle, t.legal.privacyBody], cookies: [t.legal.cookiesTitle, t.legal.cookiesBody], legal: [t.legal.legalTitle, t.legal.legalBody], terms: [t.legal.termsTitle, t.legal.termsBody],
  } as const
  const [title, body] = content[page]
  return <main id="main-content" className="page-shell"><section className="page-hero"><div className="container legal-layout"><nav className="legal-nav" aria-label={t.footer.legal}>{(Object.keys(content) as LegalKey[]).map((key) => <Link key={key} className="chip" aria-current={key === page ? 'page' : undefined} href={route.page(locale, key)}>{content[key][0]}</Link>)}</nav><article className="legal-copy"><h1>{title}</h1><p>{body}</p>{page === 'legal' && <ul><li>{legalConfig.hostingProvider}</li><li>{legalConfig.dataProvider}</li></ul>}{page === 'contact' && <a className="button button-primary" href={`mailto:${legalConfig.contactEmail}`}>{t.legal.contactAction}</a>}</article></div></section></main>
}
