export interface RegisterPayload {
  fullName: string
  email: string
  mobile: string
}

export interface TicketData {
  registrationId: number
  ticketCode: string
  status: 'CONFIRMED' | 'CHECKED_IN'
  attendeeName: string
  email: string
  mobile: string
  registeredAt: string
  eventId: number
  eventTitle: string
  eventVenue: string
  eventStartsAt: string
  eventEndsAt: string
}
