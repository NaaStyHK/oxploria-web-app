'use client'

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, ChevronDown, Heart, Menu, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { translatePathname } from '@/lib/route-translation'
import { route } from '@/lib/routes'
import { Brand } from '@/components/brand'
import { mockRepository } from '@/lib/data/mock-repository'
import { track } from '@/lib/analytics'
import { ACTIVE_CITY_CHANGED_EVENT, readActiveCityPreference, writeActiveCityPreference, writeLocalePreference } from '@/lib/browser-storage'
import { metadataAlternatePath, useMetadataAlternateLinks } from '@/lib/localized-links'

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pathname = usePathname()
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [preferredCityId, setPreferredCityId] = useState<string | null>(null)
  const explorerRef = useRef<HTMLDivElement>(null)
  const explorerButtonRef = useRef<HTMLButtonElement>(null)
  const focusExplorerOptionsRef = useRef(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileNavigationRef = useRef<HTMLDivElement>(null)
  useMetadataAlternateLinks(languageRef, pathname, languageOpen)
  const cities = useMemo(() => mockRepository.listCities(locale), [locale])
  const cityIds = useMemo(() => cities.map((city) => city.id), [cities])
  const barcelona = cities[0]
  const routeCity = cities.find((city) => pathname === route.city(locale, city.slug) || pathname.startsWith(`${route.city(locale, city.slug)}/`))
  const currentCity = routeCity ?? cities.find((city) => city.id === preferredCityId) ?? barcelona
  const links = [
    { href: route.guides(locale), label: t.nav.guides },
    { href: `${route.home(locale)}#cities`, label: t.nav.cities },
    { href: route.page(locale, 'about'), label: t.nav.about },
  ]
  const mapHref = route.map(locale, currentCity.slug)
  const favouritesHref = route.favourites(locale)
  const mobileLinks = [{ href: mapHref, label: t.nav.map }, ...links, { href: route.search(locale), label: t.search.title }]

  const selectCity = (cityId: string) => {
    writeActiveCityPreference(cityId)
    setExplorerOpen(false)
    setMenuOpen(false)
  }

  const moveExplorerFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const options = [...(explorerRef.current?.querySelectorAll<HTMLAnchorElement>('[data-explorer-option]') ?? [])]
    if (!options.length) return
    event.preventDefault()
    const currentIndex = options.indexOf(document.activeElement as HTMLAnchorElement)
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : event.key === 'ArrowDown' ? (currentIndex + 1) % options.length : (currentIndex - 1 + options.length) % options.length
    options[nextIndex]?.focus()
  }

  useEffect(() => {
    const syncPreferredCity = () => setPreferredCityId(readActiveCityPreference(cityIds))
    const timer = window.setTimeout(syncPreferredCity, 0)
    window.addEventListener(ACTIVE_CITY_CHANGED_EVENT, syncPreferredCity)
    window.addEventListener('storage', syncPreferredCity)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(ACTIVE_CITY_CHANGED_EVENT, syncPreferredCity)
      window.removeEventListener('storage', syncPreferredCity)
    }
  }, [cityIds])

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!explorerRef.current?.contains(event.target as Node)) setExplorerOpen(false)
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false)
    }
    const closeWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (languageOpen) {
          setLanguageOpen(false)
          languageButtonRef.current?.focus()
        } else if (explorerOpen) {
          setExplorerOpen(false)
          explorerButtonRef.current?.focus()
        } else if (menuOpen) {
          setMenuOpen(false)
          menuButtonRef.current?.focus()
        }
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', closeWithKeyboard)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', closeWithKeyboard)
    }
  }, [explorerOpen, languageOpen, menuOpen])

  useEffect(() => {
    if (!explorerOpen || !focusExplorerOptionsRef.current) return
    focusExplorerOptionsRef.current = false
    explorerRef.current?.querySelector<HTMLAnchorElement>('[data-explorer-option]')?.focus()
  }, [explorerOpen])

  useEffect(() => {
    if (!menuOpen) return
    mobileNavigationRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand locale={locale} />
        <nav className="desktop-nav" aria-label={t.nav.menu}>
          <div className="explorer-switcher" ref={explorerRef} onKeyDown={moveExplorerFocus}>
            <button
              ref={explorerButtonRef}
              className="nav-link explorer-trigger"
              type="button"
              aria-expanded={explorerOpen}
              aria-controls="explorer-options"
              data-active={routeCity ? 'true' : undefined}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowDown') return
                event.preventDefault()
                focusExplorerOptionsRef.current = true
                setExplorerOpen(true)
                setLanguageOpen(false)
              }}
              onClick={(event) => {
                focusExplorerOptionsRef.current = event.detail === 0
                setExplorerOpen((value) => !value)
                setLanguageOpen(false)
              }}
            >
              {t.nav.explore}<ChevronDown size={14} aria-hidden="true" />
            </button>
            {explorerOpen && <div className="explorer-menu" id="explorer-options">
              <p>{t.nav.exploreCity}</p>
              <ul>
                {cities.map((city) => <li key={city.id}>
                  <Link data-explorer-option href={route.city(locale, city.slug)} onClick={() => selectCity(city.id)}>
                    <span>{city.name}{currentCity.id === city.id && <span className="sr-only"> — {t.nav.activeCity}</span>}</span>
                    {currentCity.id === city.id && <Check size={17} aria-hidden="true" />}
                  </Link>
                </li>)}
              </ul>
            </div>}
          </div>
          {links.map((link) => <Link key={link.href} className="nav-link" href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="header-favourites" href={favouritesHref} aria-current={pathname === favouritesHref ? 'page' : undefined} aria-label={t.favourites.navLabel} title={t.favourites.navLabel}><Heart size={19} aria-hidden="true" /><span>{t.favourites.navLabel}</span></Link>
          <Link className="button button-primary button-small" href={mapHref} aria-current={pathname === mapHref ? 'page' : undefined}>{t.nav.map}</Link>
          <div className="language-switcher" ref={languageRef}>
            <button ref={languageButtonRef} className="language-button" type="button" aria-expanded={languageOpen} aria-controls="language-options" aria-label={`${t.footer.language}: ${t.localeName}`} onClick={() => { setLanguageOpen((value) => !value); setExplorerOpen(false) }}>{locale.toUpperCase()} <ChevronDown size={13} aria-hidden="true" /></button>
            {languageOpen && <ul className="language-menu" id="language-options">
              {locales.map((target) => <li key={target}><Link href={translatePathname(pathname, target)} hrefLang={target} data-locale-target={target} prefetch={false} onClick={(event) => { const alternate = metadataAlternatePath(target); if (alternate && alternate !== event.currentTarget.getAttribute('href')) { event.preventDefault(); window.location.assign(alternate) } writeLocalePreference(target); setLanguageOpen(false); track('language_changed', { from: locale, to: target }) }}>{getDictionary(target).localeName}<span className="mono">{target.toUpperCase()}</span></Link></li>)}
            </ul>}
          </div>
          <button ref={menuButtonRef} className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? t.nav.close : t.nav.menu} onClick={() => { setMenuOpen((value) => !value); setLanguageOpen(false); setExplorerOpen(false) }}>{menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}</button>
        </div>
      </div>
      {menuOpen && <div ref={mobileNavigationRef} className="mobile-menu" id="mobile-navigation"><nav aria-label={t.nav.menu}>
        <div className="mobile-explorer-group">
          <p>{t.nav.exploreCity}</p>
          {cities.map((city) => <Link key={city.id} className="nav-link mobile-city-link" href={route.city(locale, city.slug)} onClick={() => selectCity(city.id)}>
            <span>{city.name}{currentCity.id === city.id && <span className="sr-only"> — {t.nav.activeCity}</span>}</span>
            {currentCity.id === city.id && <Check size={18} aria-hidden="true" />}
          </Link>)}
        </div>
        {mobileLinks.map((link) => <Link key={link.href} className="nav-link" href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}<Link className="nav-link" href={favouritesHref} aria-current={pathname === favouritesHref ? 'page' : undefined} onClick={() => setMenuOpen(false)}><Heart size={19} aria-hidden="true" />{t.favourites.navLabel}</Link>
      </nav></div>}
    </header>
  )
}
