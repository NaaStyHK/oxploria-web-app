import { BrandMark } from '@/components/brand'
import type { Coordinates } from '@/lib/types'

export function MiniLocation({ coordinates, label }: { coordinates: Coordinates; label: string }) {
  return <div className="mini-map" role="img" aria-label={label}><svg viewBox="0 0 640 280" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="640" height="280" fill="#dfe2d3"/><path d="M-20 55 92 40l55 44 91-24 72 44 110-41 75 40 175-20M-10 190l124-45 82 43 106-31 95 49 83-34 181 28M80-30l32 105-24 88 63 145M254-20l-16 80 42 67-28 174M466-30l-46 93 32 72-19 176" fill="none" stroke="#fff" strokeWidth="11"/><path d="M-10 218c91-2 118-116 200-89 72 24 57 111 148 82 68-22 74-105 169-91 54 8 81 49 153 41" fill="none" stroke="#151515" strokeWidth="4" strokeLinecap="round"/><g transform="translate(337 174)"><BrandMark className="brand-mark" /></g><text x="18" y="258" fontFamily="Oxploria Mono" fontSize="14" fill="#151515">{coordinates.latitude.toFixed(5)}° · {coordinates.longitude.toFixed(5)}°</text></svg></div>
}
