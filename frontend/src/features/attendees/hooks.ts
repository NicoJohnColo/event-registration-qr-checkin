import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth'
import {
  cancelRegistrationByStaff,
  fetchEventAttendees,
  promoteFirstWaitlist,
} from './api'

export function useEventAttendees(eventId: number | null, query: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['staff-attendees', eventId, query.trim()],
    queryFn: () => fetchEventAttendees(eventId as number, query, token as string),
    enabled: Boolean(eventId && token),
    placeholderData: keepPreviousData,
  })
}

export function usePromoteWaitlist() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: number) => {
      if (!token) return Promise.reject(new Error('Staff authentication required.'))
      return promoteFirstWaitlist(eventId, token)
    },
    onSuccess: (_ticket, eventId) => {
      void queryClient.invalidateQueries({ queryKey: ['staff-attendees'] })
      void queryClient.invalidateQueries({ queryKey: ['checkin-stats', eventId] })
      void queryClient.invalidateQueries({ queryKey: ['staff-dashboard-metrics'] })
      void queryClient.invalidateQueries({ queryKey: ['staff-events'] })
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useStaffCancelRegistration() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registrationId: number) => {
      if (!token) return Promise.reject(new Error('Staff authentication required.'))
      return cancelRegistrationByStaff(registrationId, token)
    },
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['staff-attendees'] })
      void queryClient.invalidateQueries({ queryKey: ['checkin-stats', ticket.eventId] })
      void queryClient.invalidateQueries({ queryKey: ['staff-dashboard-metrics'] })
      void queryClient.invalidateQueries({ queryKey: ['staff-events'] })
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
