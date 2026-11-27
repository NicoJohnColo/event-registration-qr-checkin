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
        disabled={mutatingId !== null}
        onClick={() => onUndoCheckIn(row)}
        className={`bg-white ${compactMobile ? '!h-7 px-2 text-[11px]' : ''}`}
      >
        {busy ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
            <span>Undoing...</span>
          </>
        ) : (
          <>
            <Undo2 className="h-3 w-3 text-brand-primary sm:h-3.5 sm:w-3.5" />
            <span className="sm:hidden">Undo</span>
            <span className="hidden sm:inline">Undo Check-In</span>
          </>
        )}
      </Button>
    )
  }

  if (isOrganizer && (row.status === 'CONFIRMED' || row.status === 'WAITLISTED')) {
    if (confirmCancelId === row.id) {
      return (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onRequestCancel(null)}
            className={compactMobile ? '!h-7 px-2 text-[11px]' : ''}
          >
            Keep
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={busy}
            onClick={() => onConfirmCancel(row)}
            className={`border-status-red bg-status-red text-white hover:bg-red-800 ${
              compactMobile ? '!h-7 px-2 text-[11px]' : ''
            }`}
          >
            {busy ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
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
        disabled={mutatingId !== null}
        onClick={() => onRequestCancel(row.id)}
        className={compactMobile ? '!h-7 px-2 text-[11px]' : ''}
      >
        <Ban className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span>Cancel</span>
      </Button>
    )
  }

  if (compactMobile) return null
  return <span className="text-xs text-brand-navy/40">—</span>
}
