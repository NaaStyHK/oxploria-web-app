import { expect, test } from '@playwright/test'

const widths = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920]

async function expectNoPageOverflow(page: import('@playwright/test').Page) {
  await expect(page.locator('main#main-content:not([aria-busy])').last()).toBeVisible()
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
}

test('homepage and map do not create horizontal page overflow at target widths', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: Math.max(720, Math.round(width * 1.2)) })
    await page.goto('/fr')
    await expectNoPageOverflow(page)
    await page.goto('/fr/barcelone/carte')
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
