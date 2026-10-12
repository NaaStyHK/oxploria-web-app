import { expect, test } from '@playwright/test'

const productionOrigin = 'https://oxploria-web-app.vercel.app'

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

test('map, search and favorites are noindex while robots and sitemap stay public', async ({ page, request }) => {
  for (const path of ['/fr/barcelone/carte', '/fr/recherche', '/fr/favoris', '/es/favoritos', '/en/favorites']) {
    await page.goto(path)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
  }
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`${productionOrigin}/sitemap.xml`)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const sitemapText = await sitemap.text()
  expect(sitemapText).toContain(`${productionOrigin}/fr`)
  expect(sitemapText).not.toContain('/favoris')
  expect(sitemapText).not.toContain('/favoritos')
  expect(sitemapText).not.toContain('/favorites')
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
