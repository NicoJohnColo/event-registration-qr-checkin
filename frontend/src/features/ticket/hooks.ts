import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelTicket, lookupTicket } from './api'
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

export function useCancelTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TicketLookupPayload) => cancelTicket(payload),
    onSuccess: (ticket) => {
      saveCachedTicket(ticket)
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['events', String(ticket.eventId)] })
      void queryClient.invalidateQueries({ queryKey: ['staff-dashboard-metrics'] })
      void queryClient.invalidateQueries({ queryKey: ['staff-events'] })
      void queryClient.invalidateQueries({ queryKey: ['staff-attendees'] })
    },
  })
}
