'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { readFavouriteIds, writeFavouriteIds } from '@/lib/browser-storage'

export function FavouriteButton({ placeId, saveLabel, savedLabel, compact = true }: { placeId: string; saveLabel: string; savedLabel: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    queueMicrotask(() => {
      setSaved(readFavouriteIds().includes(placeId))
    })
  }, [placeId])
  const toggle = () => {
    const current = readFavouriteIds()
    const next = saved ? current.filter((id) => id !== placeId) : [...new Set([...current, placeId])]
    if (writeFavouriteIds(next)) setSaved(!saved)
  }
  return <button type="button" className={compact ? 'icon-button favourite-button' : 'button button-light'} aria-pressed={saved} aria-label={saved ? savedLabel : saveLabel} onClick={toggle}><Heart size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />{!compact && <span>{saved ? savedLabel : saveLabel}</span>}</button>
}
