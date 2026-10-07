import type { BookingOffer } from '@/lib/types'

export function BookingCard({ offer }: { offer: BookingOffer }) {
  return <a className="place-card" href={offer.url} rel="nofollow sponsored" style={{ padding: '1rem', textDecoration: 'none' }}><strong>{offer.title}</strong><span className="muted">{offer.provider}</span>{offer.price != null && offer.currency && <span className="mono">{new Intl.NumberFormat(undefined, { style: 'currency', currency: offer.currency }).format(offer.price)}</span>}</a>
}
