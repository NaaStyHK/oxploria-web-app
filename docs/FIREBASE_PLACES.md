# Firebase public places

Oxploria Web reads public place content from the existing Firebase project configured through `.env.local`. It never writes to Firestore and does not initialize Auth, Storage, Messaging, Analytics, user favourites, visits, notifications, or partner offers.

## Collections

- `barcelona` maps to `Barcelona`.
- `la-rochelle` maps to `La-Rochelle`.

Only `src/lib/data/firebase-place-repository.ts` imports Firestore query functions. UI components receive normalized `Place` values.

## Cache and refresh

Collection and document reads use the Next.js data cache with a one-hour revalidation period. Public visitors do not open real-time listeners. A new or edited Firestore place becomes visible after the cached city collection revalidates; a future trusted webhook may invalidate the `firebase-public-places` tag immediately without changing the editorial workflow.

Firebase failures are not replaced by mock places in production. They reach the localized route error boundary.

## URLs and identity

A place URL uses `<localized-name>--<firestore-document-id>`. The readable prefix comes from the localized Firebase name and the suffix preserves the stable Firestore identity and prevents collisions. When a visitor changes language, the existing suffix resolves the same document and the destination redirects to its localized canonical slug when necessary.

Legacy slugs without an ID suffix are resolved by scanning the relevant city collection and redirected to the canonical URL.

## Normalization

Translations are read from `translations.<locale>.<field>`, followed by the other available translations and then the legacy root fields. Coordinates use one shared order: `location`, `distance`, then `lat` plus `lng`. GeoPoint-compatible objects and historical `"latitude, longitude"` strings are accepted.

Documents without a usable name are skipped because no safe public URL can be generated. Documents without coordinates keep their page and list card but are excluded from maps and distance calculations. Unknown categories are retained with a deterministic slug.
