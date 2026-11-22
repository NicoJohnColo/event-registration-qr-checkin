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
