import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth'
import { fetchEventAttendees } from './api'

export function useEventAttendees(eventId: number | null, query: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['staff-attendees', eventId, query.trim()],
    queryFn: () => fetchEventAttendees(eventId as number, query, token as string),
    enabled: Boolean(eventId && token),
    placeholderData: keepPreviousData,
  })
}
