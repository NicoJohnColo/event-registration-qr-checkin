import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge, type BadgeTone } from '../../../components/ui/StatusBadge'
import { formatCebuDateTime, formatCebuTime } from '../../../lib/formatDate'
import type { AttendeeRow } from '../types'
import { AttendeeRowActions } from './AttendeeRowActions'

const PAGE_SIZE = 8

interface AttendeeTableProps {
  attendees: AttendeeRow[]
  hasFilter: boolean
  isOrganizer: boolean
  mutatingId: number | null
  confirmCancelId: number | null
  onRequestCancel: (id: number | null) => void
  onConfirmCancel: (row: AttendeeRow) => void
  onUndoCheckIn: (row: AttendeeRow) => void
  onClearFilters: () => void
}

function getRowStatusBadge(row: AttendeeRow): { tone: BadgeTone; label: string } {
  switch (row.status) {
    case 'CHECKED_IN':
      return { tone: 'green', label: 'Checked In' }
    case 'WAITLISTED':
      return {
        tone: 'amber',
        label: row.waitlistPosition ? `Waitlist #${row.waitlistPosition}` : 'Waitlisted',
      }
    case 'CANCELLED':
      return { tone: 'red', label: 'Cancelled' }
    case 'CONFIRMED':
    default:
      return { tone: 'blue', label: 'Confirmed' }
  }
}

export function AttendeeTable({
  attendees,
  hasFilter,
  isOrganizer,
  mutatingId,
  confirmCancelId,
  onRequestCancel,
  onConfirmCancel,
  onUndoCheckIn,
  onClearFilters,
}: AttendeeTableProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(attendees.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [attendees])

  if (attendees.length === 0) {
    return (
      <div className="p-5 sm:p-8">
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={hasFilter ? 'No attendees match your filter' : 'No attendees registered yet'}
          description={
            hasFilter
              ? 'Try another name, ticket code, or switch status filter back to All.'
              : 'Registrations for this event will appear here automatically.'
          }
          action={
            hasFilter ? (
              <Button variant="secondary" size="sm" onClick={onClearFilters}>
                Reset filters
              </Button>
            ) : undefined
          }
        />
      </div>
    )
  }

  const startIndex = (safePage - 1) * PAGE_SIZE
  const visibleRows = attendees.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div>
      {/* Desktop Table (≥768px): Name, Ticket, Contact, Status, Actions */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-brand-navy text-xs font-bold uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Phone &amp; Email</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {visibleRows.map((row) => {
              const badge = getRowStatusBadge(row)
              return (
                <tr
                  key={row.id}
                  className="odd:bg-surface even:bg-page/55 transition-colors hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3 text-sm font-bold text-brand-navy">{row.fullName}</td>
                  <td className="px-4 py-3">
                    <span className="font-code inline-block rounded-lg border border-brand-sky bg-sky-50 px-2.5 py-1 text-xs font-bold tracking-wider text-brand-navy">
                      {row.ticketCode}
                    </span>
                  </td>
                  <td className="max-w-[240px] px-4 py-3">
                    <div className="font-code text-xs font-semibold text-brand-navy/85">
                      {row.mobile}
                    </div>
                    <div className="mt-0.5 break-words text-xs text-brand-navy/75">{row.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-navy/75">
                    {formatCebuDateTime(row.registeredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                      {row.status === 'CHECKED_IN' && row.checkedInAt && (
                        <span className="text-[11px] font-medium text-brand-navy/70">
                          {formatCebuTime(row.checkedInAt)}
                          {row.checkedInByName ? ` · ${row.checkedInByName}` : ''}
                        </span>
                      )}
                      {row.status === 'CANCELLED' && row.cancelledAt && (
                        <span className="text-[11px] font-medium text-brand-navy/65">
                          {formatCebuTime(row.cancelledAt)}
                          {row.cancelledByName ? ` · ${row.cancelledByName}` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex justify-end">
                      <AttendeeRowActions
                        row={row}
                        isOrganizer={isOrganizer}
                        mutatingId={mutatingId}
                        confirmCancelId={confirmCancelId}
                        onRequestCancel={onRequestCancel}
                        onConfirmCancel={onConfirmCancel}
                        onUndoCheckIn={onUndoCheckIn}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Deterministic Mobile Card List (<768px) */}
      <ul className="divide-y divide-border/80 md:hidden">
        {visibleRows.map((row) => {
          const badge = getRowStatusBadge(row)
          const hasMobileAction =
            row.status === 'CHECKED_IN' ||
            (isOrganizer && (row.status === 'CONFIRMED' || row.status === 'WAITLISTED'))

          return (
            <li key={row.id} className="grid grid-cols-1 gap-1 px-3 py-3">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="min-w-0 truncate font-heading text-sm font-extrabold text-brand-navy">
                  {row.fullName}
                </p>
                <div className="shrink-0">
                  <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-code inline-block max-w-full rounded border border-brand-sky bg-sky-50 px-1.5 py-0.5 font-bold tracking-wider text-brand-navy">
                  {row.ticketCode}
                </span>
                <span className="font-code font-semibold text-brand-navy/80">{row.mobile}</span>
                {row.status === 'CHECKED_IN' && row.checkedInAt && (
                  <span className="font-bold text-status-green">
                    · In {formatCebuTime(row.checkedInAt)}
                  </span>
                )}
                {row.status === 'CANCELLED' && row.cancelledAt && (
                  <span className="font-bold text-status-red">
                    · Cancelled {formatCebuTime(row.cancelledAt)}
                  </span>
                )}
              </div>

              <p className="min-w-0 truncate break-words text-[11px] text-brand-navy/75">
                {row.email}
              </p>

              <p className="text-[11px] text-brand-navy/60">
                Registered {formatCebuDateTime(row.registeredAt)}
              </p>

              {hasMobileAction && (
                <div className="mt-1.5">
                  <AttendeeRowActions
                    row={row}
                    isOrganizer={isOrganizer}
                    mutatingId={mutatingId}
                    confirmCancelId={confirmCancelId}
                    compactMobile
                    onRequestCancel={onRequestCancel}
                    onConfirmCancel={onConfirmCancel}
                    onUndoCheckIn={onUndoCheckIn}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Pagination Footer */}
      {attendees.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-page/55 px-3 py-2 text-xs">
          <span className="font-semibold text-brand-navy/75">
            {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, attendees.length)} of{' '}
            {attendees.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-border bg-surface px-2 text-[11px] font-bold text-brand-navy transition-colors hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-1.5 text-[11px] font-bold tabular-nums text-brand-navy/80">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-border bg-surface px-2 text-[11px] font-bold text-brand-navy transition-colors hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
