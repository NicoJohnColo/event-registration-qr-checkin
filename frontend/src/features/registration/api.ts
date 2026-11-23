import { apiRequest } from '../../lib/apiClient'
import type { RegisterPayload, TicketData } from './types'

export function registerForEvent(
  eventId: number | string,
  payload: RegisterPayload,
): Promise<TicketData> {
  return apiRequest<TicketData>(`/api/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
