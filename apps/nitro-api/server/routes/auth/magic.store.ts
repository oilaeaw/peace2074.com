export const pendingLinks = new Map<string, { email: string; exp: number }>()

export function cleanExpiredLinks() {
  const now = Date.now()
  for (const [token, entry] of pendingLinks.entries()) {
    if (entry.exp <= now) pendingLinks.delete(token)
  }
}
