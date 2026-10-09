/**
 * crypto.randomUUID only exists in secure contexts, so it is missing when the
 * dev server is opened from a tablet over plain http://<lan-ip>.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
