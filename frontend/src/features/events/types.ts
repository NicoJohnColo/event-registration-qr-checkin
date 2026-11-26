export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'

export interface EventItem {
  id: number
  title: string
  description: string
  venue: string
  startsAt: string
  endsAt: string
  capacity: number
  registeredCount: number
  spotsLeft: number
  full: boolean
  ended: boolean
  status: EventStatus
  codePrefix: string
}

export interface StaffEventItem {
  id: number
  title: string
  description: string
  venue: string
  startsAt: string
  endsAt: string
  capacity: number
  status: EventStatus
  codePrefix: string
  confirmedCount: number
  waitlistCount: number
  cancelledCount: number
  checkedInCount: number
  ended: boolean
  createdAt: string
}

export interface EventUpsertPayload {
  title: string
  description: string
  venue: string
  startsAt: string
  endsAt: string
  capacity: number
  status: EventStatus
  codePrefix?: string | null
}
