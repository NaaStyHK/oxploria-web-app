export const FIRESTORE_MAX_ATTEMPTS = 3

function errorCode(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) return ''
  return String((error as { code?: unknown }).code ?? '').replace(/^firestore\//, '')
}

export function isRetryableFirestoreError(error: unknown): boolean {
  if (error instanceof Error && error.message.includes('timed out')) return true
  return ['aborted', 'deadline-exceeded', 'internal', 'resource-exhausted', 'unavailable', 'unknown'].includes(errorCode(error))
}

export async function withFirestoreRetry<T>(operation: string, task: () => Promise<T>, options: { sleep?: (milliseconds: number) => Promise<void>; random?: () => number } = {}): Promise<T> {
  const sleep = options.sleep ?? ((milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)))
  const random = options.random ?? Math.random

  for (let attempt = 1; attempt <= FIRESTORE_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      const retryable = isRetryableFirestoreError(error)
      if (!retryable || attempt === FIRESTORE_MAX_ATTEMPTS) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Firestore ${operation} failed after ${attempt} attempt${attempt === 1 ? '' : 's'}: ${message}`, { cause: error })
      }
      const delay = 250 * (2 ** (attempt - 1)) + Math.floor(random() * 120)
      console.warn(`[Oxploria] Firestore ${operation} failed on attempt ${attempt}/${FIRESTORE_MAX_ATTEMPTS}; retrying in ${delay} ms.`)
      await sleep(delay)
    }
  }

  throw new Error(`Firestore ${operation} failed unexpectedly.`)
}
