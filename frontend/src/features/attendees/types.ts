export interface AttendeeRow {
  id: number
  fullName: string
  email: string
  mobile: string
  ticketCode: string
  status: 'CONFIRMED' | 'CHECKED_IN'
  registeredAt: string
  checkedInAt: string | null
  checkedInByName: string | null
}

export interface AttendeeListData {
  eventId: number
  eventTitle: string
  capacity: number
  registeredCount: number
  checkedInCount: number
  attendees: AttendeeRow[]
}
