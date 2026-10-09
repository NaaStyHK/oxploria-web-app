import type { Category, CityRecord, GuideRecord, PlaceRecord } from '@/lib/types'

export const categories: Category[] = [
  { id: 'culture', name: { fr: 'Culture & lieux', es: 'Cultura y lugares', en: 'Culture & places' }, slug: { fr: 'culture-lieux', es: 'cultura-lugares', en: 'culture-places' } },
  { id: 'architecture', name: { fr: 'Architecture', es: 'Arquitectura', en: 'Architecture' }, slug: { fr: 'architecture', es: 'arquitectura', en: 'architecture' } },
  { id: 'local-life', name: { fr: 'Vie locale', es: 'Vida local', en: 'Local life' }, slug: { fr: 'vie-locale', es: 'vida-local', en: 'local-life' } },
  { id: 'nature', name: { fr: 'Nature & plein air', es: 'Naturaleza y aire libre', en: 'Nature & outdoors' }, slug: { fr: 'nature-plein-air', es: 'naturaleza-aire-libre', en: 'nature-outdoors' } },
]

export const cityRecords: CityRecord[] = [
  {
    id: 'barcelona',
    slug: { fr: 'barcelone', es: 'barcelona', en: 'barcelona' },
    name: { fr: 'Barcelone', es: 'Barcelona', en: 'Barcelona' },
    country: { fr: 'Espagne', es: 'España', en: 'Spain' },
    coordinates: { latitude: 41.3874, longitude: 2.1686 },
    zoom: 12.4,
    image: '/images/barcelona-stone.jpg',
    description: {
      fr: 'Une ville où deux mille ans d’histoire affleurent entre les marchés, les passages gothiques et les façades modernistes.',
      es: 'Una ciudad donde dos mil años de historia aparecen entre mercados, pasajes góticos y fachadas modernistas.',
      en: 'A city where two thousand years of history surface between markets, Gothic passages and Modernista façades.',
    },
  },
  {
    id: 'la-rochelle',
    slug: { fr: 'la-rochelle', es: 'la-rochelle', en: 'la-rochelle' },
    name: { fr: 'La Rochelle', es: 'La Rochelle', en: 'La Rochelle' },
    country: { fr: 'France', es: 'Francia', en: 'France' },
    coordinates: { latitude: 46.1591, longitude: -1.152 },
    zoom: 13.2,
    image: '/images/la-rochelle-saint-nicolas.jpg',
    description: {
      fr: 'Un port atlantique façonné par ses tours, ses arcades, ses échanges maritimes et son goût farouche pour l’indépendance.',
      es: 'Un puerto atlántico marcado por sus torres, soportales, intercambios marítimos y su firme espíritu independiente.',
      en: 'An Atlantic port shaped by its towers, arcades, maritime trade and fierce independent spirit.',
    },
  },
]

const images = {
  stone: ['/images/barcelona-stone.jpg', '/images/barcelona-market.jpg', '/images/barcelona-garden.jpg'],
  market: ['/images/barcelona-market.jpg', '/images/barcelona-stone.jpg', '/images/barcelona-garden.jpg'],
  garden: ['/images/barcelona-garden.jpg', '/images/barcelona-stone.jpg', '/images/barcelona-market.jpg'],
}

export const placeRecords: PlaceRecord[] = [
  {
    id: 'bcn-sagrada-familia', cityId: 'barcelona',
    slug: { fr: 'sagrada-familia', es: 'sagrada-familia', en: 'sagrada-familia' },
    name: { fr: 'Sagrada Família', es: 'Sagrada Família', en: 'Sagrada Família' },
    style: { fr: 'Basilique moderniste', es: 'Basílica modernista', en: 'Modernista basilica' },
    description: { fr: 'La grande œuvre inachevée d’Antoni Gaudí transforme pierre, lumière et géométrie en une forêt verticale.', es: 'La gran obra inacabada de Antoni Gaudí transforma piedra, luz y geometría en un bosque vertical.', en: 'Antoni Gaudí’s great unfinished work turns stone, light and geometry into a vertical forest.' },
    about: { fr: 'Commencée en 1882, la basilique a changé d’échelle lorsque Gaudí en a repris le projet. Chaque façade raconte un épisode différent et chaque colonne participe à une structure inspirée du vivant.', es: 'Iniciada en 1882, la basílica cambió de escala cuando Gaudí asumió el proyecto. Cada fachada cuenta un episodio distinto y cada columna participa en una estructura inspirada en la naturaleza.', en: 'Begun in 1882, the basilica changed scale when Gaudí took over the project. Each façade tells a different episode, while every column belongs to a structure inspired by living forms.' },
    hours: { fr: 'Tous les jours, horaires variables', es: 'Todos los días, horario variable', en: 'Daily, hours vary' },
    price: { fr: 'Billet requis', es: 'Entrada necesaria', en: 'Ticket required' },
    address: { fr: 'Carrer de Mallorca, 401', es: 'Carrer de Mallorca, 401', en: 'Carrer de Mallorca, 401' },
    credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' },
    coordinates: { latitude: 41.40363, longitude: 2.174356 }, categoryId: 'architecture', collections: ['Incontournables', 'Gaudí'], images: images.stone, website: 'https://sagradafamilia.org', telephone: '+34 932 08 04 14', featured: true, bookingOffers: [],
  },
  {
    id: 'bcn-casa-batllo', cityId: 'barcelona',
    slug: { fr: 'casa-batllo', es: 'casa-batllo', en: 'casa-batllo' },
    name: { fr: 'Casa Batlló', es: 'Casa Batlló', en: 'Casa Batlló' },
    style: { fr: 'Maison moderniste', es: 'Casa modernista', en: 'Modernista house' },
    description: { fr: 'Une façade ondulante où Gaudí fait disparaître la ligne droite au profit d’os, d’écailles et de lumière.', es: 'Una fachada ondulante donde Gaudí hace desaparecer la línea recta entre huesos, escamas y luz.', en: 'A rippling façade where Gaudí dissolves the straight line into bone, scales and light.' },
    about: { fr: 'Entre 1904 et 1906, Gaudí transforme un immeuble existant pour la famille Batlló. La cour centrale distribue la lumière grâce à un dégradé de céramiques bleues, tandis que le toit évoque un dos de dragon.', es: 'Entre 1904 y 1906, Gaudí transformó un edificio existente para la familia Batlló. El patio central distribuye la luz con cerámicas azules, mientras la cubierta recuerda el lomo de un dragón.', en: 'Between 1904 and 1906, Gaudí transformed an existing building for the Batlló family. Blue tiles balance light through the central court, while the roof recalls a dragon’s back.' },
    hours: { fr: 'Tous les jours, 9 h – 22 h', es: 'Todos los días, 9:00–22:00', en: 'Daily, 9am–10pm' }, price: { fr: 'Billet requis', es: 'Entrada necesaria', en: 'Ticket required' }, address: { fr: 'Passeig de Gràcia, 43', es: 'Passeig de Gràcia, 43', en: 'Passeig de Gràcia, 43' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 41.39165, longitude: 2.16492 }, categoryId: 'architecture', collections: ['Incontournables', 'Gaudí'], images: images.garden, website: 'https://www.casabatllo.es', featured: true, bookingOffers: [],
  },
  {
    id: 'bcn-arc-triomf', cityId: 'barcelona', slug: { fr: 'arc-de-triomf', es: 'arc-de-triomf', en: 'arc-de-triomf' }, name: { fr: 'Arc de Triomf', es: 'Arc de Triomf', en: 'Arc de Triomf' }, style: { fr: 'Monument civique', es: 'Monumento cívico', en: 'Civic monument' }, description: { fr: 'La porte de briques rouges construite pour accueillir l’Exposition universelle de 1888.', es: 'La puerta de ladrillo rojo construida para recibir la Exposición Universal de 1888.', en: 'The red-brick gateway built to welcome the 1888 Universal Exposition.' }, about: { fr: 'Contrairement aux arcs militaires, celui de Josep Vilaseca célèbre le progrès civil, les arts et les nations participantes. Ses frises accueillent symboliquement la ville moderne.', es: 'A diferencia de los arcos militares, el de Josep Vilaseca celebra el progreso civil, las artes y las naciones participantes.', en: 'Unlike military triumphal arches, Josep Vilaseca’s monument celebrates civic progress, the arts and participating nations.' }, hours: { fr: 'Accès libre en permanence', es: 'Acceso libre permanente', en: 'Always open' }, price: { fr: 'Gratuit', es: 'Gratis', en: 'Free' }, address: { fr: 'Passeig de Lluís Companys', es: 'Passeig de Lluís Companys', en: 'Passeig de Lluís Companys' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 41.39105, longitude: 2.18065 }, categoryId: 'culture', collections: ['En plein air'], images: images.market, featured: true, bookingOffers: [],
  },
  {
    id: 'bcn-catedral', cityId: 'barcelona', slug: { fr: 'catedral-de-barcelona', es: 'catedral-de-barcelona', en: 'barcelona-cathedral' }, name: { fr: 'Catedral de Barcelona', es: 'Catedral de Barcelona', en: 'Barcelona Cathedral' }, style: { fr: 'Cathédrale gothique', es: 'Catedral gótica', en: 'Gothic cathedral' }, description: { fr: 'Au cœur du quartier gothique, la cathédrale conserve le cloître et la mémoire de sainte Eulalie.', es: 'En el corazón del Barrio Gótico, la catedral conserva el claustro y la memoria de santa Eulalia.', en: 'At the heart of the Gothic Quarter, the cathedral preserves its cloister and the memory of Saint Eulalia.' }, about: { fr: 'L’édifice gothique s’élève entre les XIIIe et XVe siècles sur des lieux de culte plus anciens. Sa façade principale, achevée au XIXe siècle, suit des dessins médiévaux.', es: 'El edificio gótico se levantó entre los siglos XIII y XV sobre lugares de culto anteriores. Su fachada principal se terminó en el siglo XIX.', en: 'The Gothic building rose between the 13th and 15th centuries over earlier places of worship. Its main façade was completed in the 19th century.' }, hours: { fr: 'Horaires variables selon les offices', es: 'Horario variable según los oficios', en: 'Hours vary around services' }, price: { fr: 'Certaines zones sont payantes', es: 'Algunas zonas son de pago', en: 'Some areas require admission' }, address: { fr: 'Pla de la Seu, s/n', es: 'Pla de la Seu, s/n', en: 'Pla de la Seu, s/n' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 41.38396, longitude: 2.1762 }, categoryId: 'culture', collections: ['Quartier gothique'], images: images.stone, featured: true, bookingOffers: [],
  },
  {
    id: 'bcn-temple-auguste', cityId: 'barcelona', slug: { fr: 'temple-d-auguste', es: 'templo-de-augusto', en: 'temple-of-augustus' }, name: { fr: 'Temple d’Auguste', es: 'Templo de Augusto', en: 'Temple of Augustus' }, style: { fr: 'Vestige romain', es: 'Vestigio romano', en: 'Roman remains' }, description: { fr: 'Quatre colonnes romaines surgissent au milieu d’une petite cour médiévale.', es: 'Cuatro columnas romanas aparecen en medio de un pequeño patio medieval.', en: 'Four Roman columns rise unexpectedly inside a small medieval courtyard.' }, about: { fr: 'Ces colonnes appartenaient au temple qui dominait le forum de Barcino au Ier siècle av. J.-C. Elles rappellent que la trame du centre ancien suit encore celle de la ville romaine.', es: 'Estas columnas pertenecían al templo que presidía el foro de Barcino en el siglo I a. C.', en: 'These columns belonged to the temple overlooking Barcino’s forum in the 1st century BC.' }, hours: { fr: 'Du mardi au dimanche', es: 'De martes a domingo', en: 'Tuesday to Sunday' }, price: { fr: 'Gratuit', es: 'Gratis', en: 'Free' }, address: { fr: 'Carrer del Paradís, 10', es: 'Carrer del Paradís, 10', en: 'Carrer del Paradís, 10' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 41.38399, longitude: 2.17644 }, categoryId: 'culture', collections: ['Lieux cachés', 'Quartier gothique'], images: images.garden, bookingOffers: [],
  },
  {
    id: 'bcn-placa-rei', cityId: 'barcelona', slug: { fr: 'placa-del-rei', es: 'placa-del-rei', en: 'placa-del-rei' }, name: { fr: 'Plaça del Rei', es: 'Plaça del Rei', en: 'Plaça del Rei' }, style: { fr: 'Place médiévale', es: 'Plaza medieval', en: 'Medieval square' }, description: { fr: 'Une place minérale entourée par les bâtiments du pouvoir comtal et royal.', es: 'Una plaza de piedra rodeada por los edificios del poder condal y real.', en: 'A stone square enclosed by the buildings of comital and royal power.' }, about: { fr: 'L’ensemble monumental conserve le Palau Reial Major, la chapelle de Santa Àgata et la tour du roi Martí. Sous la place, le musée révèle les rues de la Barcino romaine.', es: 'El conjunto conserva el Palau Reial Major, la capilla de Santa Àgata y la torre del rey Martí.', en: 'The complex preserves the Palau Reial Major, Santa Àgata chapel and King Martí’s tower.' }, hours: { fr: 'Place accessible en permanence', es: 'Plaza siempre accesible', en: 'Square always accessible' }, price: { fr: 'Place gratuite, musée payant', es: 'Plaza gratuita, museo de pago', en: 'Square free, museum ticketed' }, address: { fr: 'Plaça del Rei', es: 'Plaça del Rei', en: 'Plaça del Rei' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 41.3841, longitude: 2.17736 }, categoryId: 'culture', collections: ['Quartier gothique'], images: images.market, bookingOffers: [],
  },
  {
    id: 'lr-tours-vieux-port', cityId: 'la-rochelle', slug: { fr: 'tours-du-vieux-port', es: 'torres-del-puerto-viejo', en: 'old-port-towers' }, name: { fr: 'Tours du Vieux-Port', es: 'Torres del Puerto Viejo', en: 'Old Port Towers' }, style: { fr: 'Fortifications maritimes', es: 'Fortificaciones marítimas', en: 'Maritime fortifications' }, description: { fr: 'Les tours Saint-Nicolas et de la Chaîne gardent l’entrée du port depuis le Moyen Âge.', es: 'Las torres de San Nicolás y de la Cadena custodian la entrada del puerto desde la Edad Media.', en: 'The Saint-Nicolas and Chain towers have guarded the harbour entrance since the Middle Ages.' }, about: { fr: 'Ces silhouettes racontent la puissance commerciale de La Rochelle. Une chaîne tendue entre les rives pouvait fermer l’accès au bassin.', es: 'Estas siluetas cuentan el poder comercial de La Rochelle. Una cadena tendida entre ambas orillas podía cerrar el puerto.', en: 'These silhouettes tell the story of La Rochelle’s trading power. A chain stretched between the banks could close the harbour.' }, hours: { fr: 'Horaires saisonniers', es: 'Horario estacional', en: 'Seasonal hours' }, price: { fr: 'Billet requis pour la visite', es: 'Entrada necesaria para la visita', en: 'Ticket required to visit' }, address: { fr: 'Vieux-Port de La Rochelle', es: 'Puerto Viejo de La Rochelle', en: 'La Rochelle Old Port' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 46.15572, longitude: -1.1551 }, categoryId: 'culture', collections: ['Incontournables'], images: images.stone, featured: true, bookingOffers: [],
  },
  {
    id: 'lr-grosse-horloge', cityId: 'la-rochelle', slug: { fr: 'grosse-horloge', es: 'gran-reloj', en: 'grosse-horloge' }, name: { fr: 'Grosse Horloge', es: 'Grosse Horloge', en: 'Grosse Horloge' }, style: { fr: 'Porte urbaine', es: 'Puerta urbana', en: 'City gate' }, description: { fr: 'L’ancienne porte médiévale relie le port aux rues à arcades de la vieille ville.', es: 'La antigua puerta medieval conecta el puerto con las calles porticadas del casco antiguo.', en: 'The former medieval gate links the harbour to the arcaded streets of the old town.' }, about: { fr: 'La porte du XIVe siècle a reçu au XVIIIe siècle son campanile actuel. Elle marque encore le passage symbolique entre la ville marchande et le quai.', es: 'La puerta del siglo XIV recibió en el XVIII su campanario actual.', en: 'The 14th-century gate received its current bell tower in the 18th century.' }, hours: { fr: 'Visible en permanence', es: 'Visible en todo momento', en: 'Always visible' }, price: { fr: 'Gratuit', es: 'Gratis', en: 'Free' }, address: { fr: 'Quai Duperré', es: 'Quai Duperré', en: 'Quai Duperré' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 46.15736, longitude: -1.15302 }, categoryId: 'architecture', collections: ['Centre historique'], images: images.market, featured: true, bookingOffers: [],
  },
  {
    id: 'lr-parc-charruyer', cityId: 'la-rochelle', slug: { fr: 'parc-charruyer', es: 'parque-charruyer', en: 'parc-charruyer' }, name: { fr: 'Parc Charruyer', es: 'Parc Charruyer', en: 'Parc Charruyer' }, style: { fr: 'Parc urbain', es: 'Parque urbano', en: 'Urban park' }, description: { fr: 'Une longue coulée verte suit les anciens fossés des fortifications jusqu’à la mer.', es: 'Un largo corredor verde sigue los antiguos fosos de las fortificaciones hasta el mar.', en: 'A long green corridor follows the former defensive ditches towards the sea.' }, about: { fr: 'Créé à la fin du XIXe siècle grâce au legs d’Adèle Charruyer, le parc transforme les anciennes limites militaires en promenade ombragée.', es: 'Creado a finales del siglo XIX gracias al legado de Adèle Charruyer, el parque convirtió las antiguas defensas en paseo.', en: 'Created in the late 19th century through Adèle Charruyer’s bequest, the park turned former military boundaries into a shaded walk.' }, hours: { fr: 'Accès libre', es: 'Acceso libre', en: 'Open access' }, price: { fr: 'Gratuit', es: 'Gratis', en: 'Free' }, address: { fr: 'Chemin des Remparts', es: 'Chemin des Remparts', en: 'Chemin des Remparts' }, credit: { fr: 'Photographies de démonstration Oxploria', es: 'Fotografías de demostración de Oxploria', en: 'Oxploria demonstration photography' }, coordinates: { latitude: 46.15875, longitude: -1.1636 }, categoryId: 'nature', collections: ['En famille'], images: images.garden, bookingOffers: [],
  },
]

export const guideRecords: GuideRecord[] = [
  {
    id: 'guide-gothic-quarter', cityId: 'barcelona',
    slug: { fr: 'que-faire-quartier-gothique', es: 'que-ver-barrio-gotico', en: 'things-to-do-gothic-quarter' },
    title: { fr: 'Que faire dans le quartier gothique de Barcelone ?', es: 'Qué ver en el Barrio Gótico de Barcelona', en: 'Things to do in Barcelona’s Gothic Quarter' },
    intro: { fr: 'Un parcours à pied entre la Barcino romaine, les cours médiévales et les places où la ville continue de vivre.', es: 'Un recorrido a pie entre la Barcino romana, patios medievales y plazas donde la ciudad sigue viva.', en: 'A walking route through Roman Barcino, medieval courtyards and squares where the city still lives.' },
    image: '/images/barcelona-stone.jpg', readMinutes: 8,
    sections: [
      { title: { fr: 'Commencer sous la ville', es: 'Empezar bajo la ciudad', en: 'Start beneath the city' }, body: { fr: 'La Barcelone visible repose sur une ville romaine entière. Autour de la Plaça del Rei, les rues antiques et les vestiges du forum donnent une profondeur immédiate au quartier.', es: 'La Barcelona visible descansa sobre una ciudad romana completa. Alrededor de la Plaça del Rei, las calles antiguas y el foro dan profundidad al barrio.', en: 'Visible Barcelona rests on an entire Roman city. Around Plaça del Rei, ancient streets and forum remains give the quarter immediate depth.' }, placeIds: ['bcn-placa-rei', 'bcn-temple-auguste'] },
      { title: { fr: 'Lire le pouvoir dans la pierre', es: 'Leer el poder en la piedra', en: 'Read power in stone' }, body: { fr: 'La cathédrale, le palais royal et les ruelles voisines montrent comment le pouvoir religieux et politique partageait le même cœur urbain.', es: 'La catedral, el palacio real y las calles vecinas muestran cómo el poder religioso y político compartía el mismo centro urbano.', en: 'The cathedral, royal palace and neighbouring lanes show how religious and political power shared the same urban centre.' }, placeIds: ['bcn-catedral', 'bcn-placa-rei'] },
    ],
    placeIds: ['bcn-temple-auguste', 'bcn-placa-rei', 'bcn-catedral'],
  },
  {
    id: 'guide-la-rochelle-port', cityId: 'la-rochelle',
    slug: { fr: 'vieux-port-a-pied', es: 'puerto-viejo-a-pie', en: 'old-port-on-foot' },
    title: { fr: 'Le Vieux-Port de La Rochelle à pied', es: 'El Puerto Viejo de La Rochelle a pie', en: 'La Rochelle’s Old Port on foot' },
    intro: { fr: 'Une promenade courte pour comprendre les tours, les quais et les anciennes portes de la ville.', es: 'Un paseo corto para comprender las torres, los muelles y las antiguas puertas de la ciudad.', en: 'A short walk through the towers, quays and old city gates.' }, image: '/images/barcelona-market.jpg', readMinutes: 6,
    sections: [{ title: { fr: 'Entrer par les tours', es: 'Entrar por las torres', en: 'Enter through the towers' }, body: { fr: 'Le port se lit comme une porte fortifiée tournée vers l’Atlantique.', es: 'El puerto se lee como una puerta fortificada frente al Atlántico.', en: 'The harbour reads like a fortified gate facing the Atlantic.' }, placeIds: ['lr-tours-vieux-port', 'lr-grosse-horloge'] }],
    placeIds: ['lr-tours-vieux-port', 'lr-grosse-horloge'],
  },
]
