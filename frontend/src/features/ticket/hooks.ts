import { useMutation } from '@tanstack/react-query'
import { lookupTicket } from './api'
import { saveCachedTicket } from './storage'
import type { TicketLookupPayload } from './types'

export function useTicketLookup() {
  return useMutation({
    mutationFn: (payload: TicketLookupPayload) => lookupTicket(payload),
    onSuccess: (ticket) => {
      saveCachedTicket(ticket)
    },
  })
}
