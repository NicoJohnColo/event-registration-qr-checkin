export type RegistrationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'WAITLISTED' | 'CANCELLED'

export interface RegisterPayload {
  fullName: string
  email: string
  mobile: string
}

export interface TicketData {
  registrationId: number
  ticketCode: string
  qrPayload?: string | null
  status: RegistrationStatus
  waitlistPosition?: number | null
  attendeeName: string
  email: string
  mobile: string
  registeredAt: string
  cancelledAt?: string | null
  eventId: number
  eventTitle: string
  eventVenue: string
  eventStartsAt: string
  eventEndsAt: string
}
