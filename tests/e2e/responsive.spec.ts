import { expect, test } from '@playwright/test'

const widths = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920]

async function expectNoPageOverflow(page: import('@playwright/test').Page) {
  await expect(page.locator('main#main-content:not([aria-busy])').last()).toBeVisible()
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
}

test('homepage, map and categories do not create horizontal page overflow at target widths', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: Math.max(720, Math.round(width * 1.2)) })
    await page.goto('/fr')
    await expectNoPageOverflow(page)
    await page.goto('/fr/barcelone/carte')
    await expectNoPageOverflow(page)
    await page.goto('/fr/barcelone/categories/architecture')
    await expectNoPageOverflow(page)
  }
})

test('core page families remain bounded on mobile, tablet and desktop', async ({ page }) => {
  const paths = [
    '/fr',
    '/fr/barcelone',
    '/fr/barcelone/carte',
    '/fr/barcelone/lieux',
    '/fr/barcelone/lieux/sagrada-familia--Sagrada-Fam%C3%ADlia',
    '/fr/barcelone/guides/que-faire-quartier-gothique',
    '/fr/recherche',
    '/fr/barcelone/categories/architecture',
    '/fr/confidentialite',
    '/fr/page-introuvable-pour-test',
  ]
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of paths) {
      await page.goto(path)
      await expectNoPageOverflow(page)
    }
  }
})

test('every published category layout remains readable on mobile and desktop', async ({ page }) => {
  const categoryPaths = [
    '/fr/barcelone/categories/culture-lieux',
    '/fr/barcelone/categories/nature-plein-air',
    '/fr/barcelone/categories/vie-locale',
    '/fr/barcelone/categories/bars',
    '/fr/barcelone/categories/loisirs-activites',
    '/fr/barcelone/categories/architecture',
    '/fr/la-rochelle/categories/culture-lieux',
    '/fr/la-rochelle/categories/nature-plein-air',
    '/fr/la-rochelle/categories/vie-locale',
    '/fr/la-rochelle/categories/loisirs-activites',
    '/fr/la-rochelle/categories/architecture',
  ]
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of categoryPaths) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page.locator('.category-intro')).toBeVisible()
      await expect(page.locator('.category-count')).toBeVisible()
      await expect(page.locator('.category-related-links')).toBeVisible()
      await expectNoPageOverflow(page)
    }
  }
})
