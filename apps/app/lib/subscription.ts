const KEY = 'cg_subscriber'
const DEVICE_KEY = 'cg_device_id'

export function getIsSubscriber(): boolean {
  if (typeof window === 'undefined') return false
  try { return localStorage.getItem(KEY) === 'true' } catch { return false }
}

export function setIsSubscriber(v: boolean): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, v ? 'true' : 'false') } catch { /* ignore */ }
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}
