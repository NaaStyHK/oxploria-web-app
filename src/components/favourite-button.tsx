'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { FAVOURITES_CHANGED_EVENT, readFavouriteIds, writeFavouriteIds } from '@/lib/browser-storage'

export function FavouriteButton({ placeId, saveLabel, savedLabel, compact = true }: { placeId: string; saveLabel: string; savedLabel: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const sync = () => setSaved(readFavouriteIds().includes(placeId))
    queueMicrotask(sync)
    window.addEventListener(FAVOURITES_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(FAVOURITES_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [placeId])
  const toggle = () => {
    const current = readFavouriteIds()
    const next = saved ? current.filter((id) => id !== placeId) : [...new Set([...current, placeId])]
    writeFavouriteIds(next)
  }
  return <button type="button" className={compact ? 'icon-button favourite-button' : 'button button-light'} data-place-id={placeId} aria-pressed={saved} aria-label={saved ? savedLabel : saveLabel} onClick={toggle}><Heart size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />{!compact && <span>{saved ? savedLabel : saveLabel}</span>}</button>
}
