import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n/config'

const LOCALE_COOKIE = 'oxploria-locale'

export function localeFromAcceptLanguage(value: string | null): Locale {
  if (!value) return 'fr'
  const accepted = value.split(',').map((part) => part.trim().split(';')[0].toLowerCase().split('-')[0])
  return accepted.find(isLocale) ?? 'fr'
}

export default async function RootPage() {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value
  const locale = cookieLocale && isLocale(cookieLocale)
    ? cookieLocale
    : localeFromAcceptLanguage((await headers()).get('accept-language'))
  redirect(`/${locale}`)
}
