import { describe, expect, it } from 'vitest'
import { categories } from '@/lib/data/mock-data'
import { formatCategoryCount, getCategoryContent, getCategoryInterface, getRelatedCategories } from '@/lib/category-content'
import { locales } from '@/lib/i18n/config'

describe('category content', () => {
  it('provides localized editorial and metadata content for every base category and city', () => {
    for (const cityId of ['barcelona', 'la-rochelle']) {
      for (const category of categories) {
        for (const locale of locales) {
          const content = getCategoryContent(cityId, category, locale)
          expect(content.intro.length).toBeGreaterThan(80)
          expect(content.metaTitle).toContain('Oxploria')
          expect(content.metaDescription.length).toBeGreaterThan(60)
        }
      }
    }
  })

  it('formats zero, singular and plural counts in FR, ES and EN', () => {
    expect([formatCategoryCount(0, 'fr'), formatCategoryCount(1, 'fr'), formatCategoryCount(2, 'fr')]).toEqual(['Aucun lieu', '1 lieu', '2 lieux'])
    expect([formatCategoryCount(0, 'es'), formatCategoryCount(1, 'es'), formatCategoryCount(2, 'es')]).toEqual(['Ningún lugar', '1 lugar', '2 lugares'])
    expect([formatCategoryCount(0, 'en'), formatCategoryCount(1, 'en'), formatCategoryCount(2, 'en')]).toEqual(['No places yet', '1 place', '2 places'])
  })

  it('keeps category navigation useful without linking to the current page', () => {
    const related = getRelatedCategories(categories, 'architecture', 3)
    expect(related).toHaveLength(3)
    expect(related.some((category) => category.id === 'architecture')).toBe(false)
  })

  it('localizes the category interface', () => {
    expect(getCategoryInterface('fr').allPlaces).toBe('Tous les lieux')
    expect(getCategoryInterface('es').allPlaces).toBe('Todos los lugares')
    expect(getCategoryInterface('en').allPlaces).toBe('All places')
  })
})
