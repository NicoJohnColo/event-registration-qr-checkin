import { Ban, Loader2, Undo2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { AttendeeRow } from '../types'

interface AttendeeRowActionsProps {
  row: AttendeeRow
  isOrganizer: boolean
  mutatingId: number | null
  confirmCancelId: number | null
  compactMobile?: boolean
  onRequestCancel: (id: number | null) => void
  onConfirmCancel: (row: AttendeeRow) => void
  onUndoCheckIn: (row: AttendeeRow) => void
}

/** Shared row action buttons for desktop table cells and mobile cards. */
export function AttendeeRowActions({
  row,
  isOrganizer,
  mutatingId,
  confirmCancelId,
  compactMobile = false,
  onRequestCancel,
  onConfirmCancel,
  onUndoCheckIn,
}: AttendeeRowActionsProps) {
  const busy = mutatingId === row.id

  if (row.status === 'CHECKED_IN') {
    return (
      <Button
        variant="outline"
        size="sm"
        fullWidth={compactMobile}
        disabled={mutatingId !== null}
        onClick={() => onUndoCheckIn(row)}
        className="bg-white"
      >
        {busy ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Undoing...</span>
          </>
        ) : (
          <>
            <Undo2 className="h-3.5 w-3.5 text-brand-primary" />
            <span>Undo Check-In</span>
          </>
        )}
      </Button>
    )
  }

  if (isOrganizer && (row.status === 'CONFIRMED' || row.status === 'WAITLISTED')) {
    if (confirmCancelId === row.id) {
      return (
        <div className={`flex items-center gap-1.5 ${compactMobile ? 'w-full' : ''}`}>
          <Button
            variant="outline"
            size="sm"
            fullWidth={compactMobile}
            disabled={busy}
            onClick={() => onRequestCancel(null)}
          >
            Keep
          </Button>
          <Button
            variant="danger"
            size="sm"
            fullWidth={compactMobile}
            disabled={busy}
            onClick={() => onConfirmCancel(row)}
            className="border-status-red bg-status-red text-white hover:bg-red-800"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>...</span>
              </>
            ) : (
              <span>Confirm</span>
            )}
          </Button>
        </div>
      )
    }

    return (
      <Button
        variant="danger"
        size="sm"
        fullWidth={compactMobile}
        disabled={mutatingId !== null}
        onClick={() => onRequestCancel(row.id)}
      >
        <Ban className="h-3.5 w-3.5" />
        <span>Cancel</span>
      </Button>
    )
  }

  if (compactMobile) return null
  return <span className="text-xs text-brand-navy/40">—</span>
}
