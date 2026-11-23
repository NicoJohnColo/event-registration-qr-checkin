import { apiRequest } from '../../lib/apiClient'
import type { AttendeeListData } from './types'

export function fetchEventAttendees(
  eventId: number,
  query: string,
  token: string,
): Promise<AttendeeListData> {
  const trimmed = query.trim()
  const qs = trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''
  return apiRequest<AttendeeListData>(`/api/staff/events/${eventId}/attendees${qs}`, {
    method: 'GET',
    token,
  })
}
