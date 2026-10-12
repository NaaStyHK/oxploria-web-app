import type { Locale, Localized } from '@/lib/i18n/config'
import type { Category } from '@/lib/types'

type CityId = 'barcelona' | 'la-rochelle'
type CategoryCopy = { intro: Localized; metaTitle: Localized; metaDescription: Localized }

const copy = (intro: Localized, metaTitle: Localized, metaDescription: Localized): CategoryCopy => ({ intro, metaTitle, metaDescription })

const categoryContent: Record<CityId, Record<string, CategoryCopy>> = {
  barcelona: {
    culture: copy(
      { fr: 'Parcourez les musées, places historiques et repères culturels qui racontent les multiples visages de Barcelone. Cette sélection relie l’héritage de la cité aux œuvres et aux usages qui animent encore ses quartiers.', es: 'Recorre los museos, plazas históricas y referentes culturales que cuentan las muchas caras de Barcelona. Esta selección conecta el legado de la ciudad con las obras y los usos que aún animan sus barrios.', en: 'Explore the museums, historic squares and cultural landmarks that reveal Barcelona’s many identities. This selection connects the city’s heritage with the works and customs that still shape its neighbourhoods.' },
      { fr: 'Culture et lieux à Barcelone | Oxploria', es: 'Cultura y lugares en Barcelona | Oxploria', en: 'Culture and places in Barcelona | Oxploria' },
      { fr: 'Découvrez les lieux culturels, musées et repères historiques de Barcelone sélectionnés par Oxploria.', es: 'Descubre los lugares culturales, museos y referentes históricos de Barcelona seleccionados por Oxploria.', en: 'Discover Barcelona’s cultural places, museums and historic landmarks selected by Oxploria.' },
    ),
    architecture: copy(
      { fr: 'Barcelone se lit dans ses pierres, du tissu médiéval aux audaces modernistes. Cette page rassemblera les bâtiments et détails urbains qui permettent de comprendre cette histoire architecturale.', es: 'Barcelona se lee en sus piedras, desde el tejido medieval hasta la audacia modernista. Esta página reunirá edificios y detalles urbanos que ayudan a comprender su historia arquitectónica.', en: 'Barcelona can be read through its buildings, from the medieval city to Modernista experimentation. This page will gather the structures and urban details that make its architectural history easier to understand.' },
      { fr: 'Architecture à Barcelone | Oxploria', es: 'Arquitectura en Barcelona | Oxploria', en: 'Architecture in Barcelona | Oxploria' },
      { fr: 'Explorez bientôt une sélection dédiée à l’architecture de Barcelone, de la ville ancienne au modernisme.', es: 'Explora próximamente una selección dedicada a la arquitectura de Barcelona, de la ciudad antigua al modernismo.', en: 'Explore a forthcoming selection dedicated to Barcelona architecture, from the old city to Modernisme.' },
    ),
    'local-life': copy(
      { fr: 'Marchés, rues vivantes et habitudes de quartier donnent accès à une Barcelone quotidienne. Découvrez des lieux où l’on observe la ville à hauteur d’habitant, loin des seuls grands monuments.', es: 'Mercados, calles animadas y costumbres de barrio acercan la Barcelona cotidiana. Descubre lugares donde la ciudad se vive a escala de sus habitantes, más allá de los grandes monumentos.', en: 'Markets, lively streets and neighbourhood rituals open a window onto everyday Barcelona. Discover places where the city is experienced at resident level, beyond its major landmarks.' },
      { fr: 'Vie locale à Barcelone | Oxploria', es: 'Vida local en Barcelona | Oxploria', en: 'Local life in Barcelona | Oxploria' },
      { fr: 'Découvrez les marchés, quartiers et lieux de vie locale de Barcelone avec Oxploria.', es: 'Descubre los mercados, barrios y lugares de vida local de Barcelona con Oxploria.', en: 'Discover Barcelona’s markets, neighbourhoods and local gathering places with Oxploria.' },
    ),
    nature: copy(
      { fr: 'Entre Méditerranée, collines et jardins urbains, Barcelone offre de nombreuses respirations. Retrouvez les parcs, belvédères et espaces de plein air pour découvrir la ville à un autre rythme.', es: 'Entre el Mediterráneo, las colinas y los jardines urbanos, Barcelona ofrece muchos espacios para respirar. Encuentra parques, miradores y lugares al aire libre para descubrir la ciudad a otro ritmo.', en: 'Between the Mediterranean, hills and urban gardens, Barcelona offers many places to pause. Find parks, viewpoints and outdoor spaces for discovering the city at a different pace.' },
      { fr: 'Nature et plein air à Barcelone | Oxploria', es: 'Naturaleza y aire libre en Barcelona | Oxploria', en: 'Nature and outdoors in Barcelona | Oxploria' },
      { fr: 'Parcs, jardins, plages et belvédères : explorez la nature et le plein air à Barcelone.', es: 'Parques, jardines, playas y miradores: explora la naturaleza y el aire libre en Barcelona.', en: 'Explore Barcelona’s parks, gardens, beaches and viewpoints with Oxploria.' },
    ),
    leisure: copy(
      { fr: 'Ajoutez une expérience ludique à votre découverte de Barcelone. Cette sélection réunit les activités qui invitent à participer, apprendre ou simplement profiter de la ville autrement.', es: 'Añade una experiencia divertida a tu visita de Barcelona. Esta selección reúne actividades para participar, aprender o simplemente disfrutar de la ciudad de otra manera.', en: 'Add a playful experience to your time in Barcelona. This selection brings together activities that invite you to take part, learn or simply enjoy the city differently.' },
      { fr: 'Loisirs et activités à Barcelone | Oxploria', es: 'Ocio y actividades en Barcelona | Oxploria', en: 'Leisure and activities in Barcelona | Oxploria' },
      { fr: 'Trouvez des loisirs et activités à faire à Barcelone grâce à la sélection Oxploria.', es: 'Encuentra ocio y actividades para hacer en Barcelona con la selección de Oxploria.', en: 'Find leisure experiences and activities in Barcelona with Oxploria’s selection.' },
    ),
    bars: copy(
      { fr: 'Découvrez Barcelone à l’heure où les comptoirs et les terrasses prennent le relais. Cette sélection met en avant des adresses où faire une pause et prolonger l’exploration de la ville.', es: 'Descubre Barcelona cuando las barras y terrazas toman el relevo. Esta selección destaca lugares donde hacer una pausa y alargar la exploración de la ciudad.', en: 'Discover Barcelona as its bars and terraces take over. This selection highlights places to pause and extend your exploration of the city.' },
      { fr: 'Bars à Barcelone | Oxploria', es: 'Bares en Barcelona | Oxploria', en: 'Bars in Barcelona | Oxploria' },
      { fr: 'Découvrez une sélection de bars à Barcelone pour prolonger votre exploration de la ville.', es: 'Descubre una selección de bares en Barcelona para alargar tu exploración de la ciudad.', en: 'Discover selected bars in Barcelona and extend your exploration of the city.' },
    ),
  },
  'la-rochelle': {
    culture: copy(
      { fr: 'Tours, musées et traces maritimes racontent une ville ouverte sur l’Atlantique. Cette sélection aide à lire l’histoire de La Rochelle dans ses monuments, ses collections et ses espaces publics.', es: 'Torres, museos y huellas marítimas cuentan una ciudad abierta al Atlántico. Esta selección ayuda a leer la historia de La Rochelle en sus monumentos, colecciones y espacios públicos.', en: 'Towers, museums and maritime traces tell the story of a city facing the Atlantic. This selection reveals La Rochelle’s history through its landmarks, collections and public spaces.' },
      { fr: 'Culture et lieux à La Rochelle | Oxploria', es: 'Cultura y lugares en La Rochelle | Oxploria', en: 'Culture and places in La Rochelle | Oxploria' },
      { fr: 'Découvrez les lieux culturels, musées et repères historiques de La Rochelle avec Oxploria.', es: 'Descubre los lugares culturales, museos y referentes históricos de La Rochelle con Oxploria.', en: 'Discover La Rochelle’s cultural places, museums and historic landmarks with Oxploria.' },
    ),
    architecture: copy(
      { fr: 'Des arcades du centre ancien aux ouvrages tournés vers le port, l’architecture structure le paysage rochelais. Cette page rassemblera les bâtiments qui éclairent les grandes étapes de cette ville maritime.', es: 'De los soportales del casco antiguo a las construcciones orientadas al puerto, la arquitectura estructura el paisaje de La Rochelle. Esta página reunirá edificios que explican las grandes etapas de esta ciudad marítima.', en: 'From the old town arcades to buildings facing the harbour, architecture shapes La Rochelle’s landscape. This page will gather structures that explain the main chapters of this maritime city.' },
      { fr: 'Architecture à La Rochelle | Oxploria', es: 'Arquitectura en La Rochelle | Oxploria', en: 'Architecture in La Rochelle | Oxploria' },
      { fr: 'Explorez bientôt une sélection dédiée à l’architecture et au patrimoine bâti de La Rochelle.', es: 'Explora próximamente una selección dedicada a la arquitectura y el patrimonio construido de La Rochelle.', en: 'Explore a forthcoming selection dedicated to La Rochelle’s architecture and built heritage.' },
    ),
    'local-life': copy(
      { fr: 'Sous les arcades, autour du marché et le long des quais se dessine la vie quotidienne rochelaise. Ces lieux montrent une ville habitée, commerçante et toujours liée à son port.', es: 'Bajo los soportales, alrededor del mercado y a lo largo de los muelles aparece la vida cotidiana de La Rochelle. Estos lugares muestran una ciudad habitada, comercial y siempre unida a su puerto.', en: 'Daily life in La Rochelle unfolds beneath the arcades, around the market and along the quays. These places reveal a lived-in trading city that remains closely tied to its harbour.' },
      { fr: 'Vie locale à La Rochelle | Oxploria', es: 'Vida local en La Rochelle | Oxploria', en: 'Local life in La Rochelle | Oxploria' },
      { fr: 'Découvrez les marchés, quartiers et lieux de vie locale de La Rochelle avec Oxploria.', es: 'Descubre los mercados, barrios y lugares de vida local de La Rochelle con Oxploria.', en: 'Discover La Rochelle’s markets, neighbourhoods and local gathering places with Oxploria.' },
    ),
    nature: copy(
      { fr: 'L’océan, les parcs et les promenades littorales offrent à La Rochelle un horizon toujours proche. Retrouvez les espaces où prendre l’air, observer le paysage et ralentir entre deux visites.', es: 'El océano, los parques y los paseos costeros mantienen siempre cerca el horizonte de La Rochelle. Encuentra espacios para respirar, observar el paisaje y bajar el ritmo entre dos visitas.', en: 'The ocean, parks and coastal walks keep the horizon close in La Rochelle. Find places to breathe, take in the landscape and slow down between visits.' },
      { fr: 'Nature et plein air à La Rochelle | Oxploria', es: 'Naturaleza y aire libre en La Rochelle | Oxploria', en: 'Nature and outdoors in La Rochelle | Oxploria' },
      { fr: 'Explorez les parcs, plages et promenades de plein air de La Rochelle avec Oxploria.', es: 'Explora los parques, playas y paseos al aire libre de La Rochelle con Oxploria.', en: 'Explore La Rochelle’s parks, beaches and outdoor walks with Oxploria.' },
    ),
    leisure: copy(
      { fr: 'Profitez de La Rochelle à travers des expériences à partager, en intérieur comme au grand air. Cette sélection rassemble des activités pour varier les rythmes et compléter une journée de découverte.', es: 'Disfruta de La Rochelle con experiencias para compartir, tanto en interiores como al aire libre. Esta selección reúne actividades para cambiar de ritmo y completar un día de descubrimiento.', en: 'Enjoy La Rochelle through experiences to share, indoors and outside. This selection brings together activities that vary the pace and round out a day of discovery.' },
      { fr: 'Loisirs et activités à La Rochelle | Oxploria', es: 'Ocio y actividades en La Rochelle | Oxploria', en: 'Leisure and activities in La Rochelle | Oxploria' },
      { fr: 'Trouvez des loisirs et activités à faire à La Rochelle grâce à la sélection Oxploria.', es: 'Encuentra ocio y actividades para hacer en La Rochelle con la selección de Oxploria.', en: 'Find leisure experiences and activities in La Rochelle with Oxploria’s selection.' },
    ),
  },
}

const interfaceCopy: Record<Locale, { allPlaces: string; otherCategories: string; categoryNavigation: string; mapAction: string; emptyTitle: string; emptyBody: string }> = {
  fr: { allPlaces: 'Tous les lieux', otherCategories: 'Explorez aussi', categoryNavigation: 'Catégories de lieux', mapAction: 'Explorer la carte', emptyTitle: 'La sélection arrive bientôt', emptyBody: 'Aucun lieu n’est encore publié dans cette catégorie. Parcourez les autres thèmes ou explorez la carte pour poursuivre votre découverte.' },
  es: { allPlaces: 'Todos los lugares', otherCategories: 'Explora también', categoryNavigation: 'Categorías de lugares', mapAction: 'Explorar el mapa', emptyTitle: 'La selección llegará pronto', emptyBody: 'Todavía no hay lugares publicados en esta categoría. Explora otros temas o abre el mapa para seguir descubriendo.' },
  en: { allPlaces: 'All places', otherCategories: 'Explore more', categoryNavigation: 'Place categories', mapAction: 'Explore the map', emptyTitle: 'The selection is coming soon', emptyBody: 'No places have been published in this category yet. Browse other themes or open the map to continue exploring.' },
}

export function getCategoryContent(cityId: string, category: Category, locale: Locale) {
  const known = categoryContent[cityId as CityId]?.[category.id]
  if (known) return { intro: known.intro[locale], metaTitle: known.metaTitle[locale], metaDescription: known.metaDescription[locale] }
  const cityName = cityId === 'barcelona' ? 'Barcelona' : 'La Rochelle'
  const fallback = {
    fr: `Découvrez les lieux classés « ${category.name.fr} » à ${cityName}. Cette sélection évolue avec les contenus touristiques publiés par Oxploria.`,
    es: `Descubre los lugares de « ${category.name.es} » en ${cityName}. Esta selección evoluciona con los contenidos turísticos publicados por Oxploria.`,
    en: `Discover ${category.name.en.toLowerCase()} places in ${cityName}. This selection grows as Oxploria publishes new visitor content.`,
  }
  return { intro: fallback[locale], metaTitle: `${category.name[locale]} — ${cityName} | Oxploria`, metaDescription: fallback[locale] }
}

export function getCategoryInterface(locale: Locale) {
  return interfaceCopy[locale]
}

export function formatCategoryCount(count: number, locale: Locale): string {
  if (locale === 'fr') return count === 0 ? 'Aucun lieu' : count === 1 ? '1 lieu' : `${count} lieux`
  if (locale === 'es') return count === 0 ? 'Ningún lugar' : count === 1 ? '1 lugar' : `${count} lugares`
  return count === 0 ? 'No places yet' : count === 1 ? '1 place' : `${count} places`
}

export function getRelatedCategories(categories: Category[], currentId: string, limit = 5): Category[] {
  return categories.filter((category) => category.id !== currentId).slice(0, limit)
}
