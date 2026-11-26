import { apiRequest } from '../../lib/apiClient'
import { getStoredToken } from '../auth/storage'
import type { EventItem, EventUpsertPayload, StaffEventItem } from './types'

export function getEvents(): Promise<EventItem[]> {
  return apiRequest<EventItem[]>('/api/events')
}

export function getEvent(id: number | string): Promise<EventItem> {
  return apiRequest<EventItem>(`/api/events/${id}`)
}

export function getStaffEvents(): Promise<StaffEventItem[]> {
  return apiRequest<StaffEventItem[]>('/api/staff/events', {
    token: getStoredToken(),
  })
}

export function createStaffEvent(payload: EventUpsertPayload): Promise<StaffEventItem> {
  return apiRequest<StaffEventItem>('/api/staff/events', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: getStoredToken(),
  })
}

export function updateStaffEvent(id: number, payload: EventUpsertPayload): Promise<StaffEventItem> {
  return apiRequest<StaffEventItem>(`/api/staff/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    token: getStoredToken(),
  })
}

export function closeStaffEvent(id: number): Promise<StaffEventItem> {
  return apiRequest<StaffEventItem>(`/api/staff/events/${id}/close`, {
    method: 'POST',
    token: getStoredToken(),
  })
}
