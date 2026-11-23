import type { TicketData } from './types'

function storageKey(code: string): string {
  return `ticket:${code.trim().toUpperCase()}`
}

export function saveCachedTicket(ticket: TicketData): void {
  try {
    sessionStorage.setItem(storageKey(ticket.ticketCode), JSON.stringify(ticket))
  } catch {
    // Ignore storage quota errors
  }
}

export function readCachedTicket(code: string | undefined): TicketData | null {
  if (!code) return null
  try {
    const raw = sessionStorage.getItem(storageKey(code))
    return raw ? (JSON.parse(raw) as TicketData) : null
  } catch {
    return null
  }
}
