# Sécurité web

## CSP en observation

Le serveur émet `Content-Security-Policy-Report-Only`. La politique autorise le code et les styles du site, les workers `blob:` de MapLibre, les tuiles OpenFreeMap, les images Firebase Storage et les connexions Firebase/Google APIs. `object-src` et `frame-ancestors` sont désactivés. La directive reste en observation car Next.js utilise actuellement des scripts et styles en ligne, et le mode de développement peut nécessiter `unsafe-eval`.

Avant tout passage en enforcement :

1. collecter les violations sur Preview et Production avec un endpoint de rapport maîtrisé ;
2. vérifier les vues carte, images, navigation et erreurs dans les trois langues ;
3. séparer si nécessaire la CSP développement/production ;
4. remplacer progressivement `unsafe-inline` et `unsafe-eval` par les mécanismes nonce/hash supportés par la version de Next.js ;
5. tester d’abord une Preview, puis activer l’enforcement sans retirer le reporting.

## Autres en-têtes

HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` et une Permissions Policy restrictive sont conservés.

## Audit npm

Firebase 12.19.0 dépend de `@firebase/firestore` 4.17.2, qui déclare `@grpc/grpc-js ~1.9.0`. L’avis npm demande une version de gRPC hors de cette plage. Un override serait donc non garanti et Firebase 13 est une mise à jour majeure ; aucun changement forcé n’est appliqué. Le chemin concerné est une dépendance Node transitive utilisée par l’outillage/SSR, tandis qu’Oxploria n’expose aucun serveur gRPC. Le risque doit être réévalué lors d’une mise à jour Firebase officiellement compatible.

Les vulnérabilités issues uniquement de `firebase-tools`, Vitest ou Playwright concernent l’outillage de développement et ne sont pas livrées dans le bundle de production. Les commandes CI doivent néanmoins exécuter `npm audit --omit=dev` séparément.
