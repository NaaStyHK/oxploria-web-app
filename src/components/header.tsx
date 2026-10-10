'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { translatePathname } from '@/lib/route-translation'
import { route } from '@/lib/routes'
import { Brand } from '@/components/brand'
import { mockRepository } from '@/lib/data/mock-repository'
import { track } from '@/lib/analytics'
import { writeLocalePreference } from '@/lib/browser-storage'
import { metadataAlternatePath, useMetadataAlternateLinks } from '@/lib/localized-links'

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pathname = usePathname()
  const [languageOpen, setLanguageOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileNavigationRef = useRef<HTMLDivElement>(null)
  useMetadataAlternateLinks(languageRef, pathname, languageOpen)
  const cities = mockRepository.listCities(locale)
  const barcelona = cities[0]
  const currentCity = cities.find((city) => pathname === route.city(locale, city.slug) || pathname.startsWith(`${route.city(locale, city.slug)}/`)) ?? barcelona
  const links = [
    { href: route.city(locale, currentCity.slug), label: t.nav.explore },
    { href: route.guides(locale), label: t.nav.guides },
    { href: `${route.home(locale)}#cities`, label: t.nav.cities },
    { href: route.page(locale, 'about'), label: t.nav.about },
  ]
  const mapHref = route.map(locale, currentCity.slug)
  const mobileLinks = [links[0], { href: mapHref, label: t.nav.map }, ...links.slice(1), { href: route.search(locale), label: t.search.title }]

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false)
    }
    const closeWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (languageOpen) {
          setLanguageOpen(false)
          languageButtonRef.current?.focus()
        } else if (menuOpen) {
          setMenuOpen(false)
          menuButtonRef.current?.focus()
        }
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeWithKeyboard)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', closeWithKeyboard)
    }
  }, [languageOpen, menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    mobileNavigationRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand locale={locale} />
        <nav className="desktop-nav" aria-label={t.nav.menu}>
          {links.map((link) => <Link key={link.href} className="nav-link" href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="button button-primary button-small" href={mapHref} aria-current={pathname === mapHref ? 'page' : undefined}>{t.nav.map}</Link>
          <div className="language-switcher" ref={languageRef}>
            <button ref={languageButtonRef} className="language-button" type="button" aria-expanded={languageOpen} aria-controls="language-options" aria-label={`${t.footer.language}: ${t.localeName}`} onClick={() => setLanguageOpen((value) => !value)}>{locale.toUpperCase()} <ChevronDown size={13} aria-hidden="true" /></button>
            {languageOpen && <ul className="language-menu" id="language-options">
              {locales.map((target) => <li key={target}><Link href={translatePathname(pathname, target)} hrefLang={target} data-locale-target={target} prefetch={false} onClick={(event) => { const alternate = metadataAlternatePath(target); if (alternate && alternate !== event.currentTarget.getAttribute('href')) { event.preventDefault(); window.location.assign(alternate) } writeLocalePreference(target); setLanguageOpen(false); track('language_changed', { from: locale, to: target }) }}>{getDictionary(target).localeName}<span className="mono">{target.toUpperCase()}</span></Link></li>)}
            </ul>}
          </div>
          <button ref={menuButtonRef} className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? t.nav.close : t.nav.menu} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}</button>
        </div>
      </div>
      {menuOpen && <div ref={mobileNavigationRef} className="mobile-menu" id="mobile-navigation"><nav aria-label={t.nav.menu}>{mobileLinks.map((link) => <Link key={link.href} className="nav-link" href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav></div>}
    </header>
  )
}
