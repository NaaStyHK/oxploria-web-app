import { notFound } from 'next/navigation'
import '../globals.css'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { LocaleDocument } from '@/components/locale-document'
import { isLocale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { siteMetadata, siteViewport } from '@/lib/site-metadata'

export const metadata = siteMetadata
export const viewport = siteViewport

export function generateStaticParams() { return locales.map((locale) => ({ locale })) }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  return <html lang={locale} data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">{t.common.skipToContent}</a><LocaleDocument locale={locale}/><Header locale={locale} />{children}<Footer locale={locale} /></body></html>
}
