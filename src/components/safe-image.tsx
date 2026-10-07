'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { ImageOff } from 'lucide-react'

export function SafeImage({ fallbackLabel, alt, ...props }: ImageProps & { fallbackLabel: string }) {
  const [failed, setFailed] = useState(false)
  if (failed || !props.src) return <div className="image-fallback" role="img" aria-label={fallbackLabel}><ImageOff size={28} aria-hidden="true"/><span>{fallbackLabel}</span></div>
  return <Image {...props} alt={alt} onError={() => setFailed(true)} />
}
