import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { formatCebuDateTime, formatCebuTime } from '../../../lib/formatDate'
import type { AttendeeRow } from '../types'

const PAGE_SIZE = 8

interface AttendeeTableProps {
  attendees: AttendeeRow[]
  hasFilter: boolean
  onClearFilters: () => void
}

export function AttendeeTable({ attendees, hasFilter, onClearFilters }: AttendeeTableProps) {
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
      {/* Desktop Table (≥768px): Name, Ticket, Phone, Email, Registered, Status */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-brand-navy text-xs font-bold uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {visibleRows.map((row) => {
              const checkedIn = row.status === 'CHECKED_IN'
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
                  <td className="font-code px-4 py-3 text-xs font-semibold text-brand-navy/85">
                    {row.mobile}
                  </td>
                  <td className="max-w-[220px] break-words px-4 py-3 text-xs text-brand-navy/80">
                    {row.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-navy/75">
                    {formatCebuDateTime(row.registeredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={checkedIn ? 'green' : 'blue'}>
                        {checkedIn ? 'Checked In' : 'Confirmed'}
                      </StatusBadge>
                      {checkedIn && row.checkedInAt && (
                        <span className="text-xs font-medium text-brand-navy/70">
                          {formatCebuTime(row.checkedInAt)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Deterministic 4-Row Mobile List (<768px) */}
      <ul className="divide-y divide-border/80 md:hidden">
        {visibleRows.map((row) => {
          const checkedIn = row.status === 'CHECKED_IN'
          return (
            <li key={row.id} className="grid grid-cols-1 gap-0.5 px-3 py-2.5">
              {/* Row 1: Name (left) + Status Pill (right) */}
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="min-w-0 truncate font-heading text-sm font-extrabold text-brand-navy">
                  {row.fullName}
                </p>
                <div className="shrink-0">
                  <StatusBadge tone={checkedIn ? 'green' : 'blue'}>
                    {checkedIn ? 'Checked In' : 'Confirmed'}
                  </StatusBadge>
                </div>
              </div>

              {/* Row 2: Ticket Code Chip + Phone Number (wrap allowed) */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-code inline-block max-w-full rounded border border-brand-sky bg-sky-50 px-1.5 py-0.5 font-bold tracking-wider text-brand-navy">
                  {row.ticketCode}
                </span>
                <span className="font-code font-semibold text-brand-navy/80">{row.mobile}</span>
                {checkedIn && row.checkedInAt && (
                  <span className="font-bold text-status-green">
                    · Checked in {formatCebuTime(row.checkedInAt)}
                  </span>
                )}
              </div>

              {/* Row 3: Email (truncate with ellipsis on its own dedicated line) */}
              <p className="min-w-0 truncate break-words text-[11px] text-brand-navy/75">
                {row.email}
              </p>

              {/* Row 4: Timestamp on its own dedicated line */}
              <p className="text-[11px] text-brand-navy/60">
                Registered {formatCebuDateTime(row.registeredAt)}
              </p>
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
