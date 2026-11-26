import { Ban, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { useCancelTicket } from '../hooks'
import type { TicketData } from '../types'

interface TicketCancelControlProps {
  ticketCode: string
  email: string
  isWaitlisted: boolean
  onCancelled: (updated: TicketData) => void
}

/** Inline two-step self-cancel action control for confirmed or waitlisted attendee passes. */
export function TicketCancelControl({
  ticketCode,
  email,
  isWaitlisted,
  onCancelled,
}: TicketCancelControlProps) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const cancelMutation = useCancelTicket()

  const handleConfirmCancel = async () => {
    setCancelError(null)
    try {
      const updated = await cancelMutation.mutateAsync({ ticketCode, email })
      setConfirmCancel(false)
      onCancelled(updated)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Unable to cancel this registration.')
    }
  }

  return (
    <div className="space-y-2 border-t border-border/70 pt-3">
      {cancelError && (
        <Alert tone="error" title="Cancellation failed">
          {cancelError}
        </Alert>
      )}

      {!confirmCancel ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-brand-navy/70">
            {isWaitlisted ? 'No longer waiting?' : 'Plans changed? Free your spot anytime.'}
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setCancelError(null)
              setConfirmCancel(true)
            }}
          >
            <Ban className="h-3.5 w-3.5 shrink-0" />
            <span>Cancel Registration</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2 rounded-[10px] border border-status-red/30 bg-red-50/70 p-3">
          <p className="text-xs font-semibold text-status-red">
            {isWaitlisted
              ? 'Leave the waitlist? You will lose your current position.'
              : 'Cancel your confirmed pass? Your spot will open up immediately.'}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={cancelMutation.isPending}
              onClick={() => setConfirmCancel(false)}
            >
              Keep Pass
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={cancelMutation.isPending}
              onClick={handleConfirmCancel}
              className="border-status-red bg-status-red text-white hover:bg-red-800"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancel</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
