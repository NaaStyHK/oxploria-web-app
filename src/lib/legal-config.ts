/**
 * Central location for legal publisher details. Null values are intentionally
 * not rendered as facts until the publisher has supplied and verified them.
 */
export const legalConfig = {
  publisherName: null,
  publisherAddress: null,
  publicationDirector: null,
  legalEmail: null,
  contactEmail: 'contact@oxploria.com',
  hostingProvider: 'Vercel Inc.',
  dataProvider: 'Google Firebase / Cloud Firestore',
} as const
