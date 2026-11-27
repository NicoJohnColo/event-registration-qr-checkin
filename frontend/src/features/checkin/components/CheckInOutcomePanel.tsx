import { Loader2, ScanLine, Undo2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ResultBanner } from '../../../components/ui/ResultBanner'
import { mapOutcomeToBanner } from '../outcomes'
import type { CheckInResponse } from '../types'

interface CheckInOutcomePanelProps {
  scanCount: number
  lastResult: CheckInResponse | null
  isUndoing: boolean
  undoingCode: string | null
  onUndo: (ticketCode: string) => void
}

/** Displays the latest door scan outcome banner, optional Undo action, or ready prompt. */
export function CheckInOutcomePanel({
  scanCount,
  lastResult,
  isUndoing,
  undoingCode,
  onUndo,
}: CheckInOutcomePanelProps) {
  if (!lastResult) {
    return (
      <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-dashed border-border bg-page/60 p-2.5 sm:block sm:rounded-[var(--radius-card)] sm:p-4 sm:text-center">
        <ScanLine className="h-4 w-4 shrink-0 text-brand-primary/65 sm:mx-auto sm:h-5 sm:w-5" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-brand-navy sm:mt-1 sm:text-sm">
            Ready for door check-in
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-navy/70 sm:text-xs">
            Enter or scan a ticket code above to verify entry.
          </p>
        </div>
      </div>
    )
  }

  const banner = mapOutcomeToBanner(lastResult)
  const canUndo =
    lastResult.checkedInAt !== null &&
    (lastResult.outcome === 'CHECKED_IN' || lastResult.outcome === 'ALREADY_CHECKED_IN')

  return (
    <div className="space-y-2.5">
      <ResultBanner
        key={`${scanCount}-${lastResult.ticketCode}-${lastResult.outcome}-${lastResult.checkedInAt ?? 'none'}`}
        tone={banner.tone}
        label={banner.label}
        title={banner.title}
        detail={banner.detail}
        meta={banner.meta}
      />

      {canUndo && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] border border-border bg-page/75 px-3 py-2">
          <span className="text-xs text-brand-navy/75">
            Scanned by mistake? Return pass to Confirmed.
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={isUndoing}
            onClick={() => onUndo(lastResult.ticketCode)}
            className="bg-white"
          >
            {isUndoing && undoingCode === lastResult.ticketCode ? (
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
        </div>
      )}
    </div>
  )
}
