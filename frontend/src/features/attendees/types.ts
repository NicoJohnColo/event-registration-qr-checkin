import type { RegistrationStatus } from '../registration/types'

export interface AttendeeRow {
  id: number
  fullName: string
  email: string
  mobile: string
  ticketCode: string
  status: RegistrationStatus
  waitlistPosition: number | null
  registeredAt: string
  checkedInAt: string | null
  checkedInByName: string | null
  cancelledAt: string | null
  cancelledByName: string | null
}

export interface AttendeeListData {
  eventId: number
  eventTitle: string
  capacity: number
  registeredCount: number
  checkedInCount: number
  attendees: AttendeeRow[]
}
