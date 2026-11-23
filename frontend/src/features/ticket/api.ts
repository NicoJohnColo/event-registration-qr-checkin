import { apiRequest } from '../../lib/apiClient'
import type { TicketData, TicketLookupPayload } from './types'

export function lookupTicket(payload: TicketLookupPayload): Promise<TicketData> {
  return apiRequest<TicketData>('/api/tickets/lookup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
