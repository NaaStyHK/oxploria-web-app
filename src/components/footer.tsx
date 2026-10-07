import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { route } from '@/lib/routes'
import { Brand } from '@/components/brand'
import { mockRepository } from '@/lib/data/mock-repository'
import { FooterLanguageLinks } from '@/components/footer-language-links'

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const cities = mockRepository.listCities(locale)
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid">
      <div className="footer-brand"><Brand locale={locale} inverse /><p>{t.footer.pitch}</p></div>
      <div className="footer-columns">
        <div className="footer-column"><h3>{t.footer.explore}</h3>{cities.map((city) => <Link key={city.id} href={route.city(locale, city.slug)}>{city.name}</Link>)}<Link href={route.guides(locale)}>{t.nav.guides}</Link><Link href={route.search(locale)}>{t.search.title}</Link></div>
        <div className="footer-column"><h3>{t.footer.company}</h3><Link href={route.page(locale, 'about')}>{t.nav.about}</Link><Link href={route.page(locale, 'contact')}>{t.legal.contactTitle}</Link></div>
        <div className="footer-column"><h3>{t.footer.legal}</h3><Link href={route.page(locale, 'privacy')}>{t.footer.privacy}</Link><Link href={route.page(locale, 'cookies')}>{t.footer.cookies}</Link><Link href={route.page(locale, 'legal')}>{t.legal.legalTitle}</Link><Link href={route.page(locale, 'terms')}>{t.footer.terms}</Link></div>
        <div className="footer-column"><h3>{t.footer.language}</h3><FooterLanguageLinks locale={locale}/></div>
      </div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} Oxploria. {t.footer.rights}</div>
  </div></footer>
}
