export type CheckInOutcome =
  | 'CHECKED_IN'
  | 'ALREADY_CHECKED_IN'
  | 'INVALID'
  | 'WRONG_DAY'
  | 'WAITLISTED'
  | 'CANCELLED'

export interface CheckInPayload {
  eventId: number
  ticketCode: string
}

export interface CheckInResponse {
  outcome: CheckInOutcome
  message: string
  ticketCode: string
  attendeeName: string | null
  checkedInAt: string | null
  checkedInByName: string | null
  checkedInCount: number
  registeredCount: number
}

export interface CheckInStats {
  eventId: number
  registeredCount: number
  checkedInCount: number
  capacity: number
}
