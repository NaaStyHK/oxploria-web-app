import { SafeImage } from '@/components/safe-image'

const responsiveImages = new Set([
  '/images/barcelona-sagrada-familia.jpg',
  '/images/la-rochelle-saint-nicolas.jpg',
  '/images/guide-barcelona-gothic-quarter.jpg',
  '/images/guide-la-rochelle-vieux-port.jpg',
])

export function EditorialImage({ src, fallbackLabel }: { src: string; fallbackLabel: string }) {
  if (!responsiveImages.has(src)) return <SafeImage src={src} alt="" fill sizes="(max-width: 639px) 100vw, 50vw" fallbackLabel={fallbackLabel} />

  const base = src.slice(0, -4)
  return <picture className="editorial-picture">
    <source type="image/avif" srcSet={`${base}-480.avif 480w, ${base}-960.avif 960w, ${base}-1200.avif 1200w`} sizes="(max-width: 639px) 100vw, 50vw" />
    <SafeImage src={src} alt="" fill sizes="(max-width: 639px) 100vw, 50vw" fallbackLabel={fallbackLabel} />
  </picture>
}
