'use client'

type GoogleFundingChoices = {
  callbackQueue?: Array<() => void>
  showRevocationMessage?: () => void
}

declare global {
  interface Window {
    googlefc?: GoogleFundingChoices
  }
}

export function queueGooglePrivacySettings(googlefc: GoogleFundingChoices): void {
  googlefc.callbackQueue ??= []
  const showRevocationMessage = googlefc.showRevocationMessage
  googlefc.callbackQueue.push(typeof showRevocationMessage === 'function'
    ? showRevocationMessage
    : () => googlefc.showRevocationMessage?.())
}

export function PrivacySettingsButton({ label }: { label: string }) {
  return <button className="footer-privacy-settings" type="button" onClick={() => {
    window.googlefc ??= {}
    queueGooglePrivacySettings(window.googlefc)
  }}>{label}</button>
}
