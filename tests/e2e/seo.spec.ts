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

test('map and search are noindex while robots and sitemap stay public', async ({ page, request }) => {
  for (const path of ['/fr/barcelone/carte', '/fr/recherche']) {
    await page.goto(path)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
  }
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`${productionOrigin}/sitemap.xml`)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain(`${productionOrigin}/fr`)
})
