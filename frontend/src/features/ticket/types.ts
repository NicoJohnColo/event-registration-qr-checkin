import type { TicketData } from '../registration/types'

export type { TicketData }

export interface TicketLookupPayload {
  ticketCode: string
  email: string
}
