'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  requestCurrentPosition,
  watchNearbyPosition,
  type GeolocationFailure,
  type GeolocationResult,
} from '@/lib/browser-geolocation'
import { clearSessionLocation, readSessionLocation, writeSessionLocation } from '@/lib/browser-storage'
import { nextNearbyReference, type NearbyPosition } from '@/lib/nearby-position'

export type NearbyLocationState = 'idle' | 'loading' | 'granted' | GeolocationFailure

export function useNearbyPosition() {
  const [position, setPosition] = useState<NearbyPosition | null>(null)
  const [state, setState] = useState<NearbyLocationState>('idle')
  const referenceRef = useRef<NearbyPosition | null>(null)
  const stopWatchRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(false)

  const stopWatch = useCallback(() => {
    stopWatchRef.current?.()
    stopWatchRef.current = null
  }, [])

  const handlePermissionDenied = useCallback(() => {
    stopWatch()
    referenceRef.current = null
    clearSessionLocation()
    if (mountedRef.current) {
      setPosition(null)
      setState('denied')
    }
  }, [stopWatch])

  const acceptPosition = useCallback((candidate: NearbyPosition, force = false) => {
    const next = force ? candidate : nextNearbyReference(referenceRef.current, candidate)
    if (next === referenceRef.current) return false
    referenceRef.current = next
    writeSessionLocation(next)
    if (mountedRef.current) {
      setPosition(next)
      setState('granted')
    }
    return true
  }, [])

  const startWatch = useCallback(() => {
    stopWatch()
    const watcher = watchNearbyPosition(
      (candidate) => { acceptPosition(candidate) },
      (reason) => {
        if (reason !== 'denied') return
        handlePermissionDenied()
      },
    )
    if (typeof watcher === 'function') stopWatchRef.current = watcher
    else if (mountedRef.current) setState(watcher)
  }, [acceptPosition, handlePermissionDenied, stopWatch])

  const activate = useCallback(async (): Promise<GeolocationResult> => {
    if (mountedRef.current) setState('loading')
    const result = await requestCurrentPosition()
    if (!mountedRef.current) return result
    if (result.ok) {
      acceptPosition(result.coordinates, true)
      startWatch()
      return result
    }
    if (result.reason === 'denied') handlePermissionDenied()
    else if (!referenceRef.current) setState(result.reason)
    else setState('granted')
    return result
  }, [acceptPosition, handlePermissionDenied, startWatch])

  const deactivate = useCallback(() => {
    stopWatch()
    referenceRef.current = null
    clearSessionLocation()
    if (mountedRef.current) {
      setPosition(null)
      setState('idle')
    }
  }, [stopWatch])

  useEffect(() => {
    mountedRef.current = true
    const stored = readSessionLocation()
    if (stored) {
      referenceRef.current = stored
      queueMicrotask(() => {
        if (!mountedRef.current) return
        setPosition(stored)
        setState('granted')
      })
      startWatch()
    }

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        stopWatch()
        return
      }
      if (!referenceRef.current) return
      void requestCurrentPosition().then((result) => {
        if (!mountedRef.current) return
        if (result.ok) acceptPosition(result.coordinates)
        else if (result.reason === 'denied') {
          handlePermissionDenied()
          return
        }
        if (referenceRef.current) startWatch()
      })
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      mountedRef.current = false
      document.removeEventListener('visibilitychange', handleVisibility)
      stopWatch()
    }
  }, [acceptPosition, handlePermissionDenied, startWatch, stopWatch])

  return { position, state, active: state === 'granted' && position !== null, activate, deactivate }
}
