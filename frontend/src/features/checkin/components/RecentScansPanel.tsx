import { ArrowRight, ChevronDown, ChevronUp, Undo2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { formatCebuTime } from '../../../lib/formatDate'
import { getScanBadge } from '../outcomes'
import type { CheckInResponse } from '../types'

interface RecentScansPanelProps {
  recentScans: CheckInResponse[]
  selectedEventId: number | null
  isUndoing: boolean
  onClear: () => void
  onUndo: (ticketCode: string) => void
}

/** Collapsible door shift scan history with per-item undo actions and roster shortcut. */
export function RecentScansPanel({
  recentScans,
  selectedEventId,
  isUndoing,
  onClear,
  onUndo,
}: RecentScansPanelProps) {
  const [historyOpenMobile, setHistoryOpenMobile] = useState(false)

  return (
    <aside className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card lg:col-span-5">
      <div className="flex items-center justify-between gap-2 border-b border-border/80 bg-page/65 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-navy/80 sm:text-xs">
            Recent Scans ({recentScans.length})
          </h2>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {recentScans.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-7 items-center px-2 text-[11px] font-bold text-brand-primary hover:underline sm:h-9 sm:text-xs"
            >
              Clear
            </button>
          )}

          {recentScans.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpenMobile((prev) => !prev)}
              className="inline-flex h-7 items-center gap-1 rounded-[var(--radius-control)] border border-border bg-surface px-2 text-[11px] font-bold text-brand-navy sm:h-9 sm:px-2.5 sm:text-xs lg:hidden"
            >
              <span>{historyOpenMobile ? 'Hide' : 'Show'}</span>
              {historyOpenMobile ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className={`${historyOpenMobile ? 'block' : 'hidden'} lg:block`}>
        {recentScans.length === 0 ? (
          <div className="px-5 py-6 text-center text-xs text-brand-navy/75">
            Scans during your shift will appear here for quick reference.
          </div>
        ) : (
          <ul className="max-h-[240px] divide-y divide-border/70 overflow-y-auto px-4 sm:px-5 lg:max-h-[420px]">
            {recentScans.map((scan, index) => {
              const badge = getScanBadge(scan)
              const canUndo =
                scan.checkedInAt !== null &&
                (scan.outcome === 'CHECKED_IN' || scan.outcome === 'ALREADY_CHECKED_IN')

              return (
                <li
                  key={`${scan.ticketCode}-${index}`}
                  className="flex items-center justify-between gap-2 py-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-code block font-bold tracking-wider text-brand-navy">
                      {scan.ticketCode}
                    </span>
                    {scan.attendeeName && (
                      <span className="block truncate font-semibold text-brand-navy/80">
                        {scan.attendeeName}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex flex-col items-end gap-0.5">
                      <StatusBadge tone={badge.tone}>{badge.text}</StatusBadge>
                      {scan.checkedInAt && (
                        <span className="text-xs text-brand-navy/70">
                          {formatCebuTime(scan.checkedInAt)}
                        </span>
                      )}
                    </div>
                    {canUndo && (
                      <button
                        type="button"
                        disabled={isUndoing}
                        onClick={() => onUndo(scan.ticketCode)}
                        title={`Undo check-in for ${scan.ticketCode}`}
                        className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-border bg-white px-2 text-[11px] font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-45"
                      >
                        <Undo2 className="h-3 w-3" />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selectedEventId && (
        <div className="border-t border-border/80 bg-page/55 p-2.5 sm:px-4 sm:py-3">
          <Link
            to={`/staff/events/${selectedEventId}/attendees`}
            className="flex h-[var(--control-h)] w-full items-center justify-between rounded-[var(--radius-control)] border border-border bg-surface px-3 text-[11px] font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary sm:px-3.5 sm:text-xs"
          >
            <span className="inline-flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-brand-primary sm:h-4 sm:w-4" />
              <span>Open Attendee Roster</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
      )}
    </aside>
  )
}
