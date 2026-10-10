import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = { title: 'Page not found | Oxploria' }

export default function GlobalNotFound() {
  return <html lang="en"><body><main id="main-content" className="page-shell"><section className="section"><div className="container"><div className="empty-state"><h1>404</h1><p>Page not found · Page introuvable · Página no encontrada</p><Link className="button button-primary" href="/en">Oxploria</Link></div></div></section></main></body></html>
}
