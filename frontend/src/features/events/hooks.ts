import { useQuery } from '@tanstack/react-query'
import { getEvent, getEvents } from './api'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })
}

export function useEvent(id: number | string | undefined) {
  return useQuery({
    queryKey: ['events', String(id)],
    queryFn: () => getEvent(id!),
    enabled: Boolean(id),
  })
}
