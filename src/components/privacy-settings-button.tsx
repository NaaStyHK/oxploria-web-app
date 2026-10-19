'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

type GoogleFundingChoices = {
  callbackQueue?: Array<() => void>
  showRevocationMessage?: () => void
}

declare global {
  interface Window {
    googlefc?: GoogleFundingChoices
  }
}

export function queueGooglePrivacySettings(googlefc: GoogleFundingChoices, onOpen?: () => void): void {
  googlefc.callbackQueue ??= []
  googlefc.callbackQueue.push(() => {
    if (typeof googlefc.showRevocationMessage !== 'function') return
    googlefc.showRevocationMessage()
    onOpen?.()
  })
}

export function PrivacySettingsButton({ label, locale }: { label: string; locale: Locale }) {
  const [notice, setNotice] = useState('')
  const timeoutRef = useRef<number | null>(null)
  const t = getDictionary(locale).footer

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [])

  const openSettings = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    const googlefc = (window.googlefc ??= {})
    if (typeof googlefc.showRevocationMessage === 'function') {
      googlefc.showRevocationMessage()
      setNotice('')
      return
    }
    setNotice(t.privacySettingsOpening)
    queueGooglePrivacySettings(googlefc, () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      setNotice('')
    })
    timeoutRef.current = window.setTimeout(() => {
      if (typeof googlefc.showRevocationMessage !== 'function') setNotice(t.privacySettingsUnavailable)
    }, 5000)
  }

  return <><button className="footer-privacy-settings" type="button" onClick={openSettings}>{label}</button>{notice && <span className="footer-privacy-feedback" role="status">{notice}</span>}</>
}
