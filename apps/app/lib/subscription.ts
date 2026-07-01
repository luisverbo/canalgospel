const DEVICE_KEY = 'cg_device_id'

// Fase 1: sem assinatura ativa até o RevenueCat ser implementado (Fase 2).
// getIsSubscriber sempre retorna false — não há ativação manual.
export function getIsSubscriber(): boolean {
  return false
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
