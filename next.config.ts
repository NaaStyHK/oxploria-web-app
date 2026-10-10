import type { NextConfig } from 'next'
import path from 'path'

const privateLanDevOrigins = [
  '127.0.0.1',
  'localhost',
  '10.*.*.*',
  '192.168.*.*',
  ...Array.from({ length: 16 }, (_, index) => `172.${index + 16}.*.*`),
]

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https://tiles.openfreemap.org",
  "img-src 'self' data: blob: https://storage.googleapis.com https://firebasestorage.googleapis.com",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://tiles.openfreemap.org",
  "worker-src 'self' blob:",
  "child-src blob:",
].join('; ')

const nextConfig: NextConfig = {
  experimental: { globalNotFound: true },
  allowedDevOrigins: privateLanDevOrigins,
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com', port: '', pathname: '/lr-histoire-388a2.firebasestorage.app/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', port: '', pathname: '/v0/b/lr-histoire-388a2.firebasestorage.app/o/**' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicyReportOnly },
      ],
    }]
  },
  async redirects() {
    return [
      { source: '/fr/notre-histoire', destination: '/fr/a-propos', permanent: true },
      { source: '/en/our-story', destination: '/en/about', permanent: true },
      { source: '/es/nuestra-historia', destination: '/es/acerca', permanent: true },
      { source: '/fr/politique-de-confidentialite', destination: '/fr/confidentialite', permanent: true },
      { source: '/en/privacy-policy', destination: '/en/privacy', permanent: true },
      { source: '/es/privacy-policy', destination: '/es/privacidad', permanent: true },
      { source: '/fr/privacy-policy', destination: '/fr/confidentialite', permanent: true },
      { source: '/en/legal-notice', destination: '/en/legal', permanent: true },
      { source: '/es/legal-notice', destination: '/es/legal', permanent: true },
      { source: '/fr/legal-notice', destination: '/fr/mentions-legales', permanent: true },
      { source: '/fr/conditions-generales-dutilisation', destination: '/fr/conditions', permanent: true },
      { source: '/en/terms-of-use', destination: '/en/terms', permanent: true },
      { source: '/es/terms-of-use', destination: '/es/condiciones', permanent: true },
      { source: '/fr/terms-of-use', destination: '/fr/conditions', permanent: true },
      { source: '/fr/devenir-partenaire', destination: '/fr/contact', permanent: true },
      { source: '/en/become-a-partner', destination: '/en/contact', permanent: true },
      { source: '/es/convertirse-en-socio', destination: '/es/contacto', permanent: true },
      { source: '/es/contact', destination: '/es/contacto', permanent: true },
    ]
  }
}

export default nextConfig
