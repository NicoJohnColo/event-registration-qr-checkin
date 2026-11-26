import type { ResultTone } from '../../components/ui/ResultBanner'
import type { BadgeTone } from '../../components/ui/StatusBadge'
import { formatCebuTime } from '../../lib/formatDate'
import type { CheckInResponse } from './types'

export function isUndoResponse(res: CheckInResponse): boolean {
  return res.outcome === 'CHECKED_IN' && !res.checkedInAt
}

export function mapOutcomeToBanner(res: CheckInResponse): {
  tone: ResultTone
  label: string
  title: string
  detail: string
  meta: string | null
} {
  if (isUndoResponse(res)) {
    return {
      tone: 'yellow',
      label: 'Check-In Undone',
      title: res.attendeeName ?? res.ticketCode,
      detail: res.message || 'Check-in undone. Ticket is now confirmed again.',
      meta: `Ticket ${res.ticketCode} · Status reset to Confirmed`,
    }
  }

  switch (res.outcome) {
    case 'CHECKED_IN':
      return {
        tone: 'green',
        label: 'Checked In',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.checkedInAt
          ? `Checked in at ${formatCebuTime(res.checkedInAt)} (Asia/Manila)`
          : 'Checked in successfully',
        meta: `Ticket ${res.ticketCode}${res.checkedInByName ? ` · Verified by ${res.checkedInByName}` : ''}`,
      }
    case 'ALREADY_CHECKED_IN':
      return {
        tone: 'yellow',
        label: 'Already Checked In',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.checkedInAt
          ? `First checked in at ${formatCebuTime(res.checkedInAt)} (Asia/Manila)`
          : 'This ticket has already checked in.',
        meta: `Ticket ${res.ticketCode}${res.checkedInByName ? ` · Original check-in by ${res.checkedInByName}` : ''}`,
      }
    case 'WAITLISTED':
      return {
        tone: 'red',
        label: 'On Waitlist',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.message || 'On waitlist — not confirmed',
        meta: `Ticket ${res.ticketCode} · Promote attendee on Roster before check-in`,
      }
    case 'CANCELLED':
      return {
        tone: 'red',
        label: 'Cancelled',
        title: res.attendeeName ?? res.ticketCode,
        detail: 'Cancelled — this registration is no longer valid for door entry.',
        meta: `Ticket ${res.ticketCode} · Entry rejected`,
      }
    case 'WRONG_DAY':
      return {
        tone: 'red',
        label: 'Not Event Day',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.message,
        meta: `Ticket ${res.ticketCode} · Not checked in`,
      }
    case 'INVALID':
    default:
      return {
        tone: 'red',
        label: 'Invalid Ticket',
        title: res.ticketCode,
        detail: 'Ticket code was not found for the selected event.',
        meta: null,
      }
  }
}

export function getScanBadge(scan: CheckInResponse): { tone: BadgeTone; text: string } {
  if (isUndoResponse(scan)) return { tone: 'amber', text: 'Undone' }
  switch (scan.outcome) {
    case 'CHECKED_IN':
      return { tone: 'green', text: 'Checked In' }
    case 'ALREADY_CHECKED_IN':
      return { tone: 'amber', text: 'Already Checked In' }
    case 'WAITLISTED':
      return { tone: 'red', text: 'Waitlisted' }
    case 'CANCELLED':
      return { tone: 'red', text: 'Cancelled' }
    case 'WRONG_DAY':
      return { tone: 'red', text: 'Wrong Day' }
    case 'INVALID':
    default:
      return { tone: 'red', text: 'Invalid' }
  }
}
