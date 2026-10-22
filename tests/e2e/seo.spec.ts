import { expect, test } from '@playwright/test'

const productionOrigin = 'https://www.oxploria.com'
const forbiddenSeoOrigin = 'https://oxploria-web-app.vercel.app'

test('canonical, hreflang and x-default share the configured origin', async ({ page }) => {
  for (const path of ['/fr', '/es/barcelona', '/en/barcelona/guides/things-to-do-gothic-quarter']) {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toMatch(new RegExp(`^${productionOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
    for (const language of ['fr', 'es', 'en', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute('href', new RegExp(`^${productionOrigin}`))
    }
  }
})

test('old place slugs resolve to current localized URLs while unknown places are not indexed', async ({ page, request }) => {
  const oldPaths = [
    '/es/la-rochelle/lugares/place-de-la-fourche--place_de_la_fourche',
    '/en/barcelona/places/busto-de-francesc-carreras-i-candi--Busto-Francesc-Carreras-ciutadella',
    '/fr/la-rochelle/lieux/parque-litoral-jean-duvignaud--parc_littoral_jean_duvignaud',
  ]

  for (const path of oldPaths) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(200)
    const html = await response.text()
    const destination = html.match(/<meta id="__next-page-redirect" http-equiv="refresh" content="0;url=([^"]+)"/)?.[1]
    expect(destination, path).toBeTruthy()
    expect(destination, path).not.toBe(path)
    const canonicalResponse = await request.get(destination!)
    expect(canonicalResponse.status(), destination).toBe(200)
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${destination!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
  }

  await page.goto('/fr/barcelone/lieux/lieu-inexistant--document-absent')
  await expect(page.locator('main h1')).toContainText('Ce lieu n’est pas sur notre carte.')
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
})

test('apostrophes are HTML-escaped only in source and sitemap URLs match parsed canonicals', async ({ page, request }) => {
  test.setTimeout(120_000)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const sitemapText = await sitemap.text()
  const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  const apostropheUrls = sitemapUrls.filter((url) => url.includes("'"))
  expect(apostropheUrls).toHaveLength(15)

  for (const expectedCanonical of apostropheUrls) {
    const path = new URL(expectedCanonical).pathname
    const response = await page.goto(path)
    expect(response?.status(), path).toBe(200)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical, path).toBe(expectedCanonical)
    expect(canonical, path).not.toContain('&#x27;')
    expect(canonical, path).not.toContain('%252')
    for (const language of ['fr', 'es', 'en', 'x-default']) {
      const href = await page.locator(`link[rel="alternate"][hreflang="${language}"]`).getAttribute('href')
      expect(href, `${path} ${language}`).toMatch(/^https:\/\/www\.oxploria\.com\//)
      expect(href, `${path} ${language}`).not.toContain(forbiddenSeoOrigin)
      expect(href, `${path} ${language}`).not.toContain('%252')
    }
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.join('\n'), path).toContain(productionOrigin)
    expect(jsonLd.join('\n'), path).not.toContain(forbiddenSeoOrigin)
  }
})

test('legal documents use the final public domain and localized alternates', async ({ page }) => {
  for (const path of ['/fr/mentions-legales', '/es/privacidad', '/en/terms']) {
    await page.goto(path)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/www\.oxploria\.com\//)
    for (const language of ['fr', 'es', 'en', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute('href', /^https:\/\/www\.oxploria\.com\//)
    }
  }
})

test('about metadata remains localized and indexable', async ({ page }) => {
  for (const item of [
    { path: '/fr/a-propos', title: 'À propos d’Oxploria' },
    { path: '/es/acerca', title: 'Acerca de Oxploria' },
    { path: '/en/about', title: 'About Oxploria' },
  ]) {
    await page.goto(item.path)
    await expect(page).toHaveTitle(new RegExp(item.title))
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${item.path}$`))
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
  }
})

test('base city maps are indexable, filtered maps are noindex, and sitemap includes only base maps', async ({ page, request }) => {
  const mapPaths = [
    '/fr/barcelone/carte', '/es/barcelona/mapa', '/en/barcelona/map',
    '/fr/la-rochelle/carte', '/es/la-rochelle/mapa', '/en/la-rochelle/map',
  ]
  for (const path of mapPaths) {
    await page.goto(path)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${productionOrigin}${path}`)
  }
  for (const path of ['/fr/barcelone/carte?category=architecture', '/fr/barcelone/carte?editorial=family', '/fr/barcelone/carte?place=example']) {
    await page.goto(path)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${productionOrigin}/fr/barcelone/carte`)
  }
  for (const path of ['/fr/recherche', '/fr/favoris', '/es/favoritos', '/en/favorites']) {
    await page.goto(path)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
  }
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`${productionOrigin}/sitemap.xml`)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const sitemapText = await sitemap.text()
  expect(sitemapText).not.toContain(forbiddenSeoOrigin)
  expect(sitemapText).toContain(`${productionOrigin}/fr`)
  for (const path of mapPaths) expect(sitemapText).toContain(`<loc>${productionOrigin}${path}</loc>`)
  expect(sitemapText).not.toContain('<loc>https://www.oxploria.com/fr/barcelone/carte?')
  for (const path of [
    '/fr/barcelone/categories/architecture',
    '/es/barcelona/categorias/arquitectura',
    '/en/barcelona/categories/architecture',
    '/fr/la-rochelle/categories/architecture',
    '/es/la-rochelle/categorias/arquitectura',
    '/en/la-rochelle/categories/architecture',
  ]) expect(sitemapText).toContain(`${productionOrigin}${path}`)
  expect(sitemapText).not.toContain('/favoris')
  expect(sitemapText).not.toContain('/favoritos')
  expect(sitemapText).not.toContain('/favorites')
  expect(sitemapText).not.toContain('/recherche')
  expect(sitemapText).not.toContain('/buscar')
  expect(sitemapText).not.toContain('/search')
  const urls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  expect(new Set(urls).size).toBe(urls.length)
})

test('category metadata and structured data reflect the localized collection', async ({ page }) => {
  await page.goto('/fr/barcelone/categories/culture-lieux')
  await expect(page).toHaveTitle('Culture et lieux à Barcelone | Oxploria')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /lieux culturels.*Barcelone/i)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/fr\/barcelone\/categories\/culture-lieux$/)
  for (const language of ['fr', 'es', 'en', 'x-default']) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveCount(1)
  }
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.flatMap((script) => JSON.parse(script.textContent || '[]')).map((item: { '@type'?: string }) => item['@type']))
  expect(types).toContain('CollectionPage')
  expect(types).toContain('BreadcrumbList')
  expect(types).toContain('ItemList')

  await page.goto('/fr/barcelone/categories/architecture')
  const emptyTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.flatMap((script) => JSON.parse(script.textContent || '[]')).map((item: { '@type'?: string }) => item['@type']))
  expect(emptyTypes).toContain('CollectionPage')
  expect(emptyTypes).toContain('BreadcrumbList')
  expect(emptyTypes).not.toContain('ItemList')
})
