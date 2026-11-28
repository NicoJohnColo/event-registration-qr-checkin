import { ArrowUpRight, Clock, Loader2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { AttendeeRow } from '../types'

interface WaitlistQueueBannerProps {
  waitlistedCount: number
  firstWaitlist: AttendeeRow | null
  capacity: number
  registeredCount: number
  isOrganizer: boolean
  isPromoting: boolean
  onPromote: () => void
}

/** Shows the next waitlisted attendee and organizer 1-click FIFO promotion control. */
export function WaitlistQueueBanner({
  waitlistedCount,
  firstWaitlist,
  capacity,
  registeredCount,
  isOrganizer,
  isPromoting,
  onPromote,
}: WaitlistQueueBannerProps) {
  if (waitlistedCount === 0) return null

  const spotsOpen = Math.max(0, capacity - registeredCount)

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50/85 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-status-amber shadow-xs sm:h-8 sm:w-8">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] font-extrabold text-brand-navy sm:text-sm">
            {waitlistedCount} {waitlistedCount === 1 ? 'attendee' : 'attendees'} on waitlist
            {firstWaitlist
              ? ` · Next: #${firstWaitlist.waitlistPosition ?? 1} ${firstWaitlist.fullName} (${firstWaitlist.ticketCode})`
              : ''}
          </p>
          <p className="mt-0.5 text-[10.5px] leading-snug text-brand-navy/75 sm:text-xs">
            {spotsOpen > 0
              ? `${spotsOpen} open ${spotsOpen === 1 ? 'seat' : 'seats'} available for waitlist promotion.`
              : `Event is at full capacity (${capacity}). Cancel a confirmed seat to promote #1.`}
          </p>
        </div>
      </div>

      {isOrganizer && (
        <Button
          variant="primary"
          size="sm"
          disabled={spotsOpen <= 0 || isPromoting}
          onClick={onPromote}
          className="w-full shrink-0 sm:w-auto"
        >
          {isPromoting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Promoting...</span>
            </>
          ) : (
            <>
              <span>Promote #1</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
