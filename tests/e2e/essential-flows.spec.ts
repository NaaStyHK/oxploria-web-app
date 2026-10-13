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

test('nearby mode ignores GPS drift and accepts a walk beyond 200 metres', async ({ browser }) => {
  const start = { latitude: 41.385, longitude: 2.173 }
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: start })
  const page = await context.newPage()
  await page.goto('/fr/barcelone/categories/culture-lieux')
  await page.getByRole('button', { name: 'Autour de moi' }).click()
  await expect(page.getByRole('button', { name: 'Par distance' })).toHaveAttribute('aria-pressed', 'true')

  const storedLatitude = async () => page.evaluate(() => {
    const value = JSON.parse(sessionStorage.getItem('oxploria-session-location') ?? 'null')
    return value?.latitude as number | undefined
  })
  await expect.poll(storedLatitude).toBeCloseTo(start.latitude, 5)

  const about100m = { latitude: start.latitude + 0.0009, longitude: start.longitude }
  await context.setGeolocation(about100m)
  await page.waitForTimeout(500)
  expect(await storedLatitude()).toBeCloseTo(start.latitude, 5)

  const over200m = { latitude: start.latitude + 0.0027, longitude: start.longitude }
  await context.setGeolocation(over200m)
  await expect.poll(storedLatitude).toBeCloseTo(over200m.latitude, 5)
  await expect(page.locator('.category-directory .place-card-footer .mono').first()).toBeVisible()
  await context.close()
})

test('map updates the session position without passive recenter and recentres on a manual refresh', async ({ browser }) => {
  const start = { latitude: 41.385, longitude: 2.173 }
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: start })
  const page = await context.newPage()
  await page.goto('/fr/barcelone/carte')
  const nearbyButton = page.getByRole('button', { name: 'Autour de moi' }).first()
  await nearbyButton.click()
  await expect(nearbyButton).toHaveAttribute('aria-pressed', 'true')
  const map = page.locator('.map-canvas').last()
  await expect(map).toHaveAttribute('data-recenter-request', '1')

  const moved = { latitude: start.latitude + 0.003, longitude: start.longitude }
  await context.setGeolocation(moved)
  await expect.poll(() => page.evaluate(() => {
    const value = JSON.parse(sessionStorage.getItem('oxploria-session-location') ?? 'null')
    return value?.latitude as number | undefined
  })).toBeCloseTo(moved.latitude, 5)
  await expect(map).toHaveAttribute('data-recenter-request', '1')

  await nearbyButton.click()
  await expect(map).toHaveAttribute('data-recenter-request', '2')
  await context.close()
})

test('city nearby results refresh while moving and the last position follows navigation', async ({ browser }) => {
  const start = { latitude: 41.385, longitude: 2.173 }
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: start })
  const page = await context.newPage()
  await page.goto('/fr/barcelone')
  await page.getByRole('button', { name: 'Voir les lieux proches' }).click()
  const firstDistance = page.locator('.city-nearby-section .place-card-footer .mono').first()
  await expect(firstDistance).toBeVisible()
  const before = await firstDistance.textContent()

  await context.setGeolocation({ latitude: start.latitude + 0.0045, longitude: start.longitude })
  await expect.poll(async () => firstDistance.textContent()).not.toBe(before)
  await page.goto('/fr/barcelone/carte')
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

test('favorites persist across cities, update immediately and discard stale ids', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/fr/barcelone/lieux')
  const barcelonaHeart = page.locator('.place-card .favourite-button').first()
  await barcelonaHeart.click()
  const barcelonaId = await barcelonaHeart.getAttribute('data-place-id')
  expect(barcelonaId).toBeTruthy()

  await page.goto('/fr/la-rochelle/lieux')
  const laRochelleHeart = page.locator('.place-card .favourite-button').first()
  await laRochelleHeart.click()
  const laRochelleId = await laRochelleHeart.getAttribute('data-place-id')
  expect(laRochelleId).toBeTruthy()

  await page.goto('/fr/favoris')
  await expect(page.locator('.favourites-grid .place-card')).toHaveCount(2)
  await expect(page.locator('.favourites-grid')).toContainText('Barcelone')
  await expect(page.locator('.favourites-grid')).toContainText('La Rochelle')
  await page.reload()
  await expect(page.locator('.favourites-grid .place-card')).toHaveCount(2)
  await page.locator('.favourites-grid .favourite-button').first().click()
  await expect(page.locator('.favourites-grid .place-card')).toHaveCount(1)
  await page.locator('.favourites-grid .favourite-button').click()
  await expect(page.getByText('Vous n’avez encore aucun lieu enregistré.')).toBeVisible()

  await page.evaluate(() => localStorage.setItem('oxploria-favourites', JSON.stringify(['obsolete-place-id'])))
  await page.reload()
  await expect(page.getByText('Vous n’avez encore aucun lieu enregistré.')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('oxploria-favourites'))).toBe('[]')
})

test('favorites routes and product pages are localized', async ({ page }) => {
  for (const item of [
    { path: '/fr/favoris', title: 'Mes favoris' },
    { path: '/es/favoritos', title: 'Mis favoritos' },
    { path: '/en/favorites', title: 'My favorites' },
  ]) {
    await page.goto(item.path)
    await expect(page.locator('main h1')).toHaveText(item.title)
  }
  for (const item of [
    { path: '/fr/a-propos', title: 'Pourquoi Oxploria' },
    { path: '/es/acerca', title: 'Por qué Oxploria' },
    { path: '/en/about', title: 'Why Oxploria' },
  ]) {
    await page.goto(item.path)
    await expect(page.getByRole('heading', { name: item.title })).toBeVisible()
    await expect(page.locator('main h1')).toHaveCount(1)
  }
  await page.goto('/fr/favoris')
  await page.getByRole('button', { name: /langue/i }).click()
  await page.locator('#language-options').getByRole('link', { name: /Español/i }).click()
  await expect(page).toHaveURL(/\/es\/favoritos$/)
})

test('favorites access is explicit across desktop pages and the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/fr/barcelone/lieux')
  const placePath = await page.locator('.place-card-link').first().getAttribute('href')
  expect(placePath).toBeTruthy()
  for (const path of [
    '/fr',
    '/fr/barcelone',
    placePath!,
    '/fr/barcelone/categories/culture-lieux',
    '/fr/barcelone/carte',
  ]) {
    await page.goto(path)
    const favorites = page.locator('.header-favourites')
    await expect(favorites).toBeVisible()
    await expect(favorites).toContainText('Favoris')
    await expect(favorites).toHaveAttribute('title', 'Favoris')
  }
  await page.locator('.header-favourites').click()
  await expect(page).toHaveURL(/\/fr\/favoris$/)
  await expect(page.locator('.header-favourites')).toHaveAttribute('aria-current', 'page')
  await page.goBack()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/fr/barcelone')
  const compactFavorites = page.locator('.header-favourites')
  await expect(compactFavorites).toHaveAttribute('aria-label', 'Favoris')
  await expect(compactFavorites).toHaveCSS('min-height', '44px')
  await page.getByRole('button', { name: 'Menu' }).click()
  const mobileFavorites = page.locator('#mobile-navigation').getByRole('link', { name: 'Favoris' })
  await expect(mobileFavorites).toBeVisible()
  await mobileFavorites.click()
  await expect(page).toHaveURL(/\/fr\/favoris$/)
})

test('city suggestions become real proximity results and reuse session location', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: { latitude: 41.385, longitude: 2.173 } })
  const page = await context.newPage()
  await page.goto('/fr/barcelone')
  await expect(page.getByRole('heading', { name: 'Suggestions pour commencer' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Près de vous' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Voir les lieux proches' }).click()
  await expect(page.getByRole('heading', { name: 'Près de vous' })).toBeVisible()
  await expect(page.locator('.city-nearby-section .place-card-footer .mono').first()).toBeVisible()
  await page.goto('/fr/la-rochelle')
  await expect(page.getByRole('heading', { name: 'Près de vous' })).toBeVisible()
  await context.close()
})

test('city geolocation refusal keeps editorial suggestions available', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('/fr/barcelone')
  await page.getByRole('button', { name: 'Voir les lieux proches' }).click()
  await expect(page.getByRole('status')).toContainText(/refusé|indisponible|impossible/i)
  await expect(page.getByRole('heading', { name: 'Suggestions pour commencer' })).toBeVisible()
  await context.close()
})

test('search suggestions, no-results recovery and local-life wording work in each locale', async ({ page }) => {
  for (const item of [
    { path: '/fr/recherche', suggestions: 'Suggestions', reset: 'Effacer la recherche' },
    { path: '/es/buscar', suggestions: 'Sugerencias', reset: 'Borrar la búsqueda' },
    { path: '/en/search', suggestions: 'Suggestions', reset: 'Clear search' },
  ]) {
    await page.goto(item.path)
    await expect(page.getByRole('heading', { name: item.suggestions })).toBeVisible()
    const suggestion = page.locator('.search-suggestion-list button').first()
    await suggestion.click()
    await expect(page.locator('.results-grid .place-card').first()).toBeVisible()
    await page.locator('.search-input').fill('zzzz-no-place-zzzz')
    await expect(page.getByRole('button', { name: item.reset })).toBeVisible()
  }
  await page.goto('/fr/barcelone')
  await expect(page.getByRole('heading', { name: 'Sorties & vie locale' })).toBeVisible()
  await page.goto('/es/barcelona')
  await expect(page.getByRole('heading', { name: 'Planes y vida local' })).toBeVisible()
  await page.goto('/en/barcelona')
  await expect(page.getByRole('heading', { name: 'Outings & local life' })).toBeVisible()
})

test('search exposes every matching result through 24-card batches in FR, ES and EN', async ({ page }) => {
  const locales = [
    { path: '/fr/recherche', more: 'Afficher plus' },
    { path: '/es/buscar', more: 'Mostrar más' },
    { path: '/en/search', more: 'Show more' },
  ]
  for (const item of locales) {
    await page.goto(item.path)
    await page.locator('.search-suggestion-list button').first().click()
    const totalText = await page.locator('.search-results-count').textContent()
    const total = Number.parseInt(totalText ?? '', 10)
    expect(total).toBeGreaterThan(24)
    await expect(page.locator('.results-grid .place-card')).toHaveCount(24)
    await page.getByRole('button', { name: item.more }).click()
    await expect(page.locator('.results-grid .place-card')).toHaveCount(Math.min(48, total))
  }

  await page.goto('/fr/recherche')
  await page.locator('.search-suggestion-list button').first().click()
  const total = Number.parseInt(await page.locator('.search-results-count').textContent() ?? '', 10)
  const more = page.getByRole('button', { name: 'Afficher plus' })
  while (await more.isVisible()) await more.click()
  await expect(page.locator('.results-grid .place-card')).toHaveCount(total)
  await expect(more).toHaveCount(0)

  await page.locator('.search-input').fill('zzzz-no-place-zzzz')
  await expect(page.locator('.results-grid .place-card')).toHaveCount(0)
  await expect(page.getByText('Aucun résultat pour cette recherche.')).toBeVisible()
  await page.locator('.search-input').fill('Sagrada Família')
  await expect(page.locator('.search-results-count')).toHaveText('1 résultat')
  await expect(page.locator('.results-grid .place-card')).toHaveCount(1)
})

test('editorial view-all links preserve city and selection context', async ({ page }) => {
  await page.goto('/fr')
  const mustSeeSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Les incontournables' }) })
  await mustSeeSection.getByRole('link', { name: 'Tout voir' }).click()
  await expect(page).toHaveURL('/fr/barcelone/carte?editorial=must-see')
  await expect(page.getByRole('button', { name: 'Incontournables' })).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/fr')
  await page.locator('.home-city-option').filter({ hasText: 'La Rochelle' }).click()
  const familySection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'À faire en famille' }) })
  await familySection.getByRole('link', { name: 'Tout voir' }).click()
  await expect(page).toHaveURL('/fr/la-rochelle/carte?editorial=family')
  await expect(page.getByRole('button', { name: 'En famille' })).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/fr/la-rochelle')
  const localLifeSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Sorties & vie locale' }) })
  await localLifeSection.getByRole('link', { name: 'Tout voir' }).click()
  await expect(page).toHaveURL('/fr/la-rochelle/carte?editorial=local-life')
  await expect(page.getByRole('button', { name: 'Sorties & vie locale' })).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/es/barcelona')
  const spanishMustSee = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Imprescindibles' }) })
  await spanishMustSee.getByRole('link', { name: 'Ver todo' }).click()
  await expect(page).toHaveURL('/es/barcelona/mapa?editorial=must-see')
  await expect(page.getByRole('button', { name: 'Imprescindibles' })).toHaveAttribute('aria-pressed', 'true')
})

test('global map link follows the stored city across global pages and languages', async ({ page }) => {
  await page.goto('/fr')
  await page.locator('.home-city-option').filter({ hasText: 'La Rochelle' }).click()
  await page.goto('/fr/favoris')
  await expect(page.locator('.header-actions').getByRole('link', { name: 'Carte' })).toHaveAttribute('href', '/fr/la-rochelle/carte')

  await page.goto('/fr')
  await page.locator('.home-city-option').filter({ hasText: 'Barcelone' }).click()
  await page.goto('/fr/recherche')
  await expect(page.locator('.header-actions').getByRole('link', { name: 'Carte' })).toHaveAttribute('href', '/fr/barcelone/carte')

  await page.evaluate(() => localStorage.removeItem('oxploria-active-city'))
  await page.reload()
  await expect(page.locator('.header-actions').getByRole('link', { name: 'Carte' })).toHaveAttribute('href', '/fr/barcelone/carte')

  await page.evaluate(() => localStorage.setItem('oxploria-active-city', 'la-rochelle'))
  await page.reload()
  await page.getByRole('button', { name: /langue/i }).click()
  await page.locator('#language-options').getByRole('link', { name: 'Español' }).click()
  await expect(page.locator('.header-actions').getByRole('link', { name: 'Mapa' })).toHaveAttribute('href', '/es/la-rochelle/mapa')
  await page.getByRole('button', { name: /idioma/i }).click()
  await page.locator('#language-options').getByRole('link', { name: 'English' }).click()
  await expect(page.locator('.header-actions').getByRole('link', { name: 'Map' })).toHaveAttribute('href', '/en/la-rochelle/map')
})

test('desktop Explorer offers localized city routes and updates the active city', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('/fr')
  await page.getByRole('button', { name: 'Explorer', exact: true }).click()
  const frenchOptions = page.locator('#explorer-options')
  await expect(frenchOptions.getByText('Explorer une ville')).toBeVisible()
  await frenchOptions.getByRole('link', { name: /^La Rochelle/ }).click()
  await expect(page).toHaveURL('/fr/la-rochelle')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('oxploria-active-city'))).toBe('la-rochelle')

  await page.goto('/fr/favoris')
  await expect(page.locator('.header-actions').getByRole('link', { name: 'Carte' })).toHaveAttribute('href', '/fr/la-rochelle/carte')

  await page.goto('/es')
  await page.getByRole('button', { name: 'Explorar', exact: true }).click()
  await page.locator('#explorer-options').getByRole('link', { name: /^Barcelona/ }).click()
  await expect(page).toHaveURL('/es/barcelona')

  await page.goto('/en')
  await page.getByRole('button', { name: 'Explore', exact: true }).click()
  await page.locator('#explorer-options').getByRole('link', { name: /^La Rochelle/ }).click()
  await expect(page).toHaveURL('/en/la-rochelle')
})

test('desktop Explorer supports keyboard navigation, Escape and outside click', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/fr/barcelone')
  const trigger = page.getByRole('button', { name: 'Explorer', exact: true })

  await trigger.focus()
  await trigger.press('Enter')
  const options = page.locator('#explorer-options')
  await expect(options).toBeVisible()
  await expect(options.getByRole('link', { name: /^Barcelone/ })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(options.getByRole('link', { name: /^La Rochelle/ })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(options).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(options).toBeVisible()
  await page.locator('main').click({ position: { x: 8, y: 120 } })
  await expect(options).toBeHidden()
})

test('mobile Explorer exposes both cities and keeps the Cities destination link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/fr')
  await page.getByRole('button', { name: 'Menu' }).click()
  const navigation = page.locator('#mobile-navigation')
  await expect(navigation.getByText('Explorer une ville')).toBeVisible()
  await expect(navigation.getByRole('link', { name: /^Barcelone/ })).toBeVisible()
  await expect(navigation.getByRole('link', { name: /^La Rochelle/ })).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Villes', exact: true })).toBeVisible()
  await navigation.getByRole('link', { name: /^La Rochelle/ }).click()
  await expect(page).toHaveURL('/fr/la-rochelle')
  await expect(navigation).toBeHidden()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('oxploria-active-city'))).toBe('la-rochelle')
})

test('category pages handle many, one and zero places', async ({ page }) => {
  await page.goto('/fr/barcelone/categories/culture-lieux')
  await expect(page.locator('main h1')).toHaveText('Culture & lieux')
  await expect(page.locator('.category-count')).toHaveText('205 lieux')
  await expect(page.locator('.category-results .place-card')).toHaveCount(36)
  await expect(page.getByRole('button', { name: 'Afficher plus' })).toBeVisible()

  await page.goto('/fr/barcelone/categories/loisirs-activites')
  await expect(page.locator('.category-count')).toHaveText('1 lieu')
  await expect(page.locator('.category-results .place-card')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Voir sur la carte' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Autour de moi' })).toBeVisible()

  await page.goto('/fr/barcelone/categories/architecture')
  await expect(page.locator('.category-count')).toHaveText('Aucun lieu')
  await expect(page.locator('.category-empty')).toBeVisible()
  await expect(page.locator('.category-related-links a')).toHaveCount(5)
  await expect(page.getByRole('link', { name: 'Voir sur la carte' })).toHaveAttribute('href', /category=architecture$/)
})

test('category map actions preserve the stable category filter', async ({ page }) => {
  for (const item of [
    { path: '/fr/barcelone/categories/culture-lieux', category: 'Culture & lieux' },
    { path: '/fr/la-rochelle/categories/nature-plein-air', category: 'Nature & plein air' },
    { path: '/fr/barcelone/categories/architecture', category: 'Architecture' },
  ]) {
    await page.goto(item.path)
    await page.getByRole('link', { name: 'Voir sur la carte' }).click()
    await expect(page).toHaveURL(/\/carte\?category=/)
    await expect(page.getByRole('button', { name: item.category })).toHaveAttribute('aria-pressed', 'true')
  }
})

test('category nearby sorts the complete collection and carries session proximity to the map', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['geolocation'], geolocation: { latitude: 41.385, longitude: 2.173 } })
  const page = await context.newPage()
  await page.goto('/fr/barcelone/categories/culture-lieux')
  await page.getByRole('button', { name: 'Autour de moi' }).click()
  await expect(page.getByRole('button', { name: 'Par distance' })).toHaveAttribute('aria-pressed', 'true')
  const distanceLocator = page.locator('.category-directory .place-card-footer .mono')
  await expect(distanceLocator.first()).toBeVisible()
  const parseDistance = (value: string) => value.includes('km') ? Number.parseFloat(value.replace(',', '.')) * 1000 : Number.parseFloat(value)
  const firstBatch = (await distanceLocator.allTextContents()).map(parseDistance)
  expect(firstBatch.length).toBe(36)
  expect(firstBatch).toEqual([...firstBatch].sort((a, b) => a - b))
  while (await page.getByRole('button', { name: 'Afficher plus' }).isVisible()) await page.getByRole('button', { name: 'Afficher plus' }).click()
  const allDistances = (await distanceLocator.allTextContents()).map(parseDistance)
  expect(allDistances.length).toBe(205)
  expect(allDistances).toEqual([...allDistances].sort((a, b) => a - b))
  await page.getByRole('link', { name: 'Voir sur la carte' }).click()
  await expect(page.getByRole('button', { name: 'Culture & lieux' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Autour de moi' })).toHaveAttribute('aria-pressed', 'true')
  await context.close()
})

test('category nearby refusal keeps the normal list usable', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('/fr/barcelone/categories/culture-lieux')
  const firstPlace = await page.locator('.category-directory .place-card h3').first().innerText()
  await page.getByRole('button', { name: 'Autour de moi' }).click()
  await expect(page.getByRole('status')).toContainText(/refusé|indisponible|impossible/i)
  await expect(page.locator('.category-directory .place-card h3').first()).toHaveText(firstPlace)
  await context.close()
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
  await page.goto('/es/la-rochelle/categorias/naturaleza-aire-libre')
  await expect(page.getByRole('link', { name: 'Ver en el mapa' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cerca de mí' })).toBeVisible()
  await page.goto('/en/la-rochelle/categories/nature-outdoors')
  await expect(page.getByRole('link', { name: 'View on map' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Near me' })).toBeVisible()
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
