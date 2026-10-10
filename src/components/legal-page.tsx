import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLegalDocument, type LegalKey } from '@/lib/legal-content'
import { legalConfig } from '@/lib/legal-config'
import { route } from '@/lib/routes'

const pages: LegalKey[] = ['about', 'contact', 'legal', 'privacy', 'cookies', 'terms']
const legalPages: LegalKey[] = ['legal', 'privacy', 'cookies', 'terms']

export function LegalPage({ locale, page }: { locale: Locale; page: LegalKey }) {
  const t = getDictionary(locale)
  const document = getLegalDocument(locale, page)
  return <main id="main-content" className="page-shell"><section className="page-hero legal-hero"><div className="container legal-layout">
    <nav className="legal-nav" aria-label={t.footer.legal}>{pages.map((key) => <Link key={key} className="chip" aria-current={key === page ? 'page' : undefined} href={route.page(locale, key)}>{getLegalDocument(locale, key).title}</Link>)}</nav>
    <article className="legal-copy">
      <header className="legal-copy-header"><h1>{document.title}</h1>{document.updatedLabel && <p className="legal-updated">{document.updatedLabel}</p>}<p className="legal-intro">{document.intro}</p></header>
      <div className="legal-sections">{document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}{section.links && <div className="legal-links">{section.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<ExternalLink size={15} aria-hidden="true" /></a>)}</div>}</section>)}</div>
      {page === 'contact' && <a className="button button-primary legal-contact" href={`mailto:${legalConfig.contactEmail}`}>{t.legal.contactAction}</a>}
      {legalPages.includes(page) && <nav className="legal-related" aria-label={t.footer.legal}>{legalPages.filter((key) => key !== page).map((key) => <Link key={key} href={route.page(locale, key)}>{getLegalDocument(locale, key).title}</Link>)}</nav>}
    </article>
  </div></section></main>
}
