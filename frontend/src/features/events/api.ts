import { apiRequest } from '../../lib/apiClient'
import type { EventItem } from './types'

export function getEvents(): Promise<EventItem[]> {
  return apiRequest<EventItem[]>('/api/events')
}

export function getEvent(id: number | string): Promise<EventItem> {
  return apiRequest<EventItem>(`/api/events/${id}`)
}
