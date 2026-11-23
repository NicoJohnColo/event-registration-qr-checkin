import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerForEvent } from './api'
import type { RegisterPayload } from './types'

export function useRegisterForEvent(eventId: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerForEvent(eventId, payload),
    onSuccess: (ticket) => {
      try {
        sessionStorage.setItem(`ticket:${ticket.ticketCode}`, JSON.stringify(ticket))
      } catch {
        // Ignore storage quota errors; router state still carries the ticket
      }
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['events', String(eventId)] })
    },
  })
}
