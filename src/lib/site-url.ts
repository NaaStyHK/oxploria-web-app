const LOCAL_SITE_URL = 'http://localhost:3000'

function normalizeSiteUrl(value: string): string {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  const url = new URL(candidate)
  return url.origin
}

export function siteUrlFromEnvironment(environment: NodeJS.ProcessEnv = process.env): string {
  const explicit = environment.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return normalizeSiteUrl(explicit)

  const vercelDomain = environment.VERCEL_PROJECT_PRODUCTION_URL?.trim() || environment.VERCEL_URL?.trim()
  if (vercelDomain) return normalizeSiteUrl(vercelDomain)

  if (environment.NODE_ENV === 'development' || environment.NODE_ENV === 'test') return LOCAL_SITE_URL
  throw new Error('NEXT_PUBLIC_SITE_URL or a Vercel production URL is required for production builds.')
}

export function absoluteSiteUrl(path = '/'): string {
  return new URL(path, `${siteUrlFromEnvironment()}/`).toString()
}
