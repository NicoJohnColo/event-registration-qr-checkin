import { apiRequest } from '../../lib/apiClient'
import type { TicketData } from '../registration/types'
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

export function promoteFirstWaitlist(eventId: number, token: string): Promise<TicketData> {
  return apiRequest<TicketData>(`/api/staff/events/${eventId}/promote-waitlist`, {
    method: 'POST',
    token,
  })
}

export function cancelRegistrationByStaff(
  registrationId: number,
  token: string,
): Promise<TicketData> {
  return apiRequest<TicketData>(`/api/staff/registrations/${registrationId}/cancel`, {
    method: 'POST',
    token,
  })
}
