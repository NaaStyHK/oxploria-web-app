import { expect, test } from '@playwright/test'

test('homepage, city selection and primary navigation', async ({ page }) => {
  await page.goto('/fr')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByRole('link', { name: /Barcelone/i }).first()).toBeVisible()
  await page.getByRole('link', { name: /Barcelone/i }).first().click()
  await expect(page).toHaveURL(/\/fr\/barcelone/)
  await expect(page.locator('main h1')).toContainText(/Barcelone/i)
})

test('map, editorial filters, list view and a place detail', async ({ page }) => {
  await page.goto('/fr/barcelone/carte')
  await expect(page.locator('main h1')).toContainText('Carte touristique de Barcelone')
  await page.getByRole('button', { name: 'Incontournables' }).click()
  await expect(page.getByText(/résultat/).first()).toBeVisible()
  await page.getByRole('button', { name: 'En famille' }).click()
  await expect(page.getByRole('button', { name: 'En famille' })).toHaveAttribute('aria-pressed', 'true')
  const listButton = page.getByRole('button', { name: 'Liste' })
  if (await listButton.isVisible()) await listButton.click()
  await page.goto('/fr/barcelone/lieux')
  const firstPlace = page.locator('main article a.place-card-link').first()
  await expect(firstPlace).toBeVisible()
  await firstPlace.click()
  await expect(page).toHaveURL(/\/fr\/barcelone\/lieux\/.+/)
  await expect(page.locator('main h1')).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/fr\/barcelone\/lieux/)
})

test('language changes FR to ES to EN', async ({ page }) => {
  await page.goto('/fr')
  await page.getByRole('button', { name: /langue|idioma|language/i }).click()
  await page.locator('#language-options').getByRole('link', { name: /Español/i }).click()
  await expect(page).toHaveURL(/\/es(?:$|\/)/)
  await page.getByRole('button', { name: /idioma|language/i }).click()
  await page.locator('#language-options').getByRole('link', { name: /English/i }).click()
  await expect(page).toHaveURL(/\/en(?:$|\/)/)
})

test('simulated geolocation activates proximity mode', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: { latitude: 41.385, longitude: 2.173 } })
  const page = await context.newPage()
  await page.goto('/fr/barcelone/carte')
  await page.getByRole('button', { name: 'Autour de moi' }).first().click()
  await expect(page.getByRole('button', { name: 'Autour de moi' }).first()).toHaveAttribute('aria-pressed', 'true')
  await context.close()
})

test('search, guide and 404', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/fr/recherche')
  await page.getByPlaceholder(/Sagrada Família/i).fill('Sagrada')
  await expect(page.getByText(/Sagrada/i).first()).toBeVisible()

  await page.goto('/fr/barcelone/guides/que-faire-quartier-gothique')
  await expect(page.locator('main h1')).toContainText(/quartier gothique/i)
  await page.goto('/fr/page-introuvable-pour-test')
  await expect(page.locator('main h1')).toContainText('404')
})

test('category pages handle many, one and zero places', async ({ page }) => {
  await page.goto('/fr/barcelone/categories/culture-lieux')
  await expect(page.locator('main h1')).toHaveText('Culture & lieux')
  await expect(page.locator('.category-count')).toHaveText('205 lieux')
  await expect(page.locator('.category-results .place-card')).toHaveCount(205)

  await page.goto('/fr/barcelone/categories/loisirs-activites')
  await expect(page.locator('.category-count')).toHaveText('1 lieu')
  await expect(page.locator('.category-results .place-card')).toHaveCount(1)

  await page.goto('/fr/barcelone/categories/architecture')
  await expect(page.locator('.category-count')).toHaveText('Aucun lieu')
  await expect(page.locator('.category-empty')).toBeVisible()
  await expect(page.locator('.category-related-links a')).toHaveCount(5)
})

test('category pages localize their content and preserve translated routes', async ({ page }) => {
  const pages = [
    { path: '/fr/la-rochelle/categories/architecture', count: 'Aucun lieu', heading: 'Tous les lieux' },
    { path: '/es/la-rochelle/categorias/arquitectura', count: 'Ningún lugar', heading: 'Todos los lugares' },
    { path: '/en/la-rochelle/categories/architecture', count: 'No places yet', heading: 'All places' },
  ]
  for (const item of pages) {
    await page.goto(item.path)
    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.locator('.category-count')).toHaveText(item.count)
    await expect(page.locator('.category-results h2')).toHaveText(item.heading)
    await expect(page.locator('.category-intro')).not.toBeEmpty()
  }
})

for (const legalPage of [
  { locale: 'fr', path: '/fr/mentions-legales', title: 'Mentions légales' },
  { locale: 'es', path: '/es/privacidad', title: 'Política de privacidad' },
  { locale: 'en', path: '/en/cookies', title: 'Cookies and local storage' },
] as const) {
  test(`${legalPage.locale} legal pages expose localized content and cross-links`, async ({ page }) => {
    await page.goto(legalPage.path)
    await expect(page.locator('main h1')).toHaveText(legalPage.title)
    await expect(page.locator('.legal-updated')).toContainText('2026')
    await expect(page.locator('.legal-related a')).toHaveCount(3)
    await expect(page.locator('footer')).toContainText(/Cookies/)
  })
}
