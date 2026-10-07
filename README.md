# Oxploria Web V2

Application web mobile-first de découverte culturelle, disponible en français, espagnol et anglais. Elle associe une carte interactive, des fiches de lieux, des guides éditoriaux et une recherche locale. Cette V2 vit dans son propre dossier et ne modifie pas le site historique voisin.

## Démarrage

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Le serveur écoute sur `http://localhost:3000` et redirige la racine vers `/en`.

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

Créez un fichier `.env.local` non versionné à partir de `.env.example`, puis renseignez la configuration Firebase Web existante :

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Ces valeurs correspondent à la configuration publique d’une application Firebase Web. Aucun service account, secret Firebase Admin ou fichier de clé privée ne doit être ajouté au projet.

## Architecture

- `src/app` : routes App Router, métadonnées, sitemap, robots, états d’erreur et de chargement.
- `src/components` : navigation, cartes de contenu, recherche, favoris et expérience MapLibre.
- `src/lib/data/firebase-place-repository.ts` : lectures serveur des 296 lieux réels de Barcelone et La Rochelle, mises en cache pendant une heure.
- `src/lib/data/firebase-adapter.ts` : validation et normalisation des documents Firestore.
- `src/lib/data/mock-data.ts` et `mock-repository.ts` : nom historique des données statiques de villes, catégories et guides éditoriaux ; les lieux affichés proviennent de Firestore.
- `src/lib/i18n/dictionaries.ts` : interface et contenu partagés en `fr`, `es` et `en`.
- `src/lib/routes.ts` et `src/lib/route-translation.ts` : segments localisés et conservation de l’entité lors d’un changement de langue.

La carte repose sur MapLibre GL et des tuiles OpenStreetMap. Les workers MapLibre sont servis localement depuis `public` pour éviter les erreurs de chargement en production. La géolocalisation ne se déclenche qu’après une action explicite et toutes ses issues disposent d’un message localisé. Les distances sont calculées côté client avec Haversine.

## Routes principales

Les exemples français ont leurs équivalents espagnols et anglais :

- `/fr`, `/es`, `/en`
- `/fr/barcelone`, `/fr/la-rochelle`
- `/fr/barcelone/carte`, `/fr/barcelone/lieux`
- `/fr/barcelone/lieux/sagrada-familia`
- `/fr/barcelone/categories/architecture`
- `/fr/guides`, `/fr/barcelone/guides/que-faire-quartier-gothique`
- `/fr/recherche`
- `/fr/a-propos`, `/fr/contact`, `/fr/confidentialite`, `/fr/cookies`, `/fr/mentions-legales`, `/fr/conditions`

Les anciennes routes éditoriales sont redirigées de façon permanente dans `next.config.ts`. Les pages de carte et de recherche restent hors du sitemap ; les cartes demandent aussi `noindex, follow` afin de privilégier les fiches et guides comme points d’entrée SEO.

## Données et intégrations futures

Les lieux sont lus depuis Firebase uniquement dans la couche serveur `firebase-place-repository.ts`. L’adaptateur accepte `location`, le champ historique `distance` sous la forme `"latitude, longitude"`, ou `lat/lng`, puis expose une seule coordonnée normalisée au reste du produit. Les guides restent statiques et résolvent leurs références vers les IDs Firestore.

Les emplacements publicitaires, offres de réservation et événements analytics sont des stubs inactifs. Les publicités de développement disparaissent automatiquement en production. La configuration Firebase Web est nécessaire pour lire les lieux et générer les pages ; aucun credential Firebase Admin, identifiant AdSense ou identifiant affilié n’est requis.

## Validation

Le contrôle manuel couvre les largeurs 375, 390, 430, 768, 1024 et 1440 px, la navigation mobile, la carte et sa liste alternative, la recherche vide, le changement de langue sur une même fiche, les redirections historiques, l’état de délai de géolocalisation et le tri par distance avec une position fournie. Le lint, le typage TypeScript et le build de production doivent rester verts avant livraison.
