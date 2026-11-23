import { Users } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { formatCebuDateTime, formatCebuTime } from '../../../lib/formatDate'
import type { AttendeeRow } from '../types'

interface AttendeeTableProps {
  attendees: AttendeeRow[]
  hasSearch: boolean
  onClearSearch: () => void
}

export function AttendeeTable({ attendees, hasSearch, onClearSearch }: AttendeeTableProps) {
  if (attendees.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title={hasSearch ? 'No attendees match that search' : 'No attendees registered yet'}
        description={
          hasSearch
            ? 'Try another name fragment or full/partial ticket code.'
            : 'Registrations for this event will appear here automatically.'
        }
        action={
          hasSearch ? (
            <Button variant="secondary" size="sm" onClick={onClearSearch}>
              Clear search
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div>
      {/* Desktop Sticky-Header Table */}
      <div className="hidden overflow-hidden rounded-[20px] border border-border bg-surface shadow-card md:block">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-brand-navy text-xs font-bold uppercase tracking-wider text-white">
              <tr>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Mobile</th>
                <th className="px-4 py-3.5">Ticket Code</th>
                <th className="px-4 py-3.5">Registered At</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {attendees.map((row) => {
                const checkedIn = row.status === 'CHECKED_IN'
                return (
                  <tr
                    key={row.id}
                    className="odd:bg-surface even:bg-page/60 transition-colors hover:bg-sky-50/50"
                  >
                    <td className="px-4 py-3 font-bold text-brand-navy">{row.fullName}</td>
                    <td className="px-4 py-3 text-xs text-brand-navy/80">{row.email}</td>
                    <td className="font-code px-4 py-3 text-xs font-semibold text-brand-navy/80">
                      {row.mobile}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-code inline-block rounded-lg border border-brand-sky bg-sky-50 px-2.5 py-1 text-xs font-bold tracking-wider text-brand-navy">
                        {row.ticketCode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-navy/75">
                      {formatCebuDateTime(row.registeredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <StatusBadge tone={checkedIn ? 'green' : 'blue'}>
                          {checkedIn ? 'Checked In' : 'Confirmed'}
                        </StatusBadge>
                        {checkedIn && row.checkedInAt && (
                          <p className="text-[11px] font-medium text-brand-navy/60">
                            at {formatCebuTime(row.checkedInAt)}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="space-y-3 md:hidden">
        {attendees.map((row) => {
          const checkedIn = row.status === 'CHECKED_IN'
          return (
            <article
              key={row.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-base font-extrabold text-brand-navy">
                    {row.fullName}
                  </h3>
                  <p className="break-words text-xs text-brand-navy/70">{row.email}</p>
                </div>
                <StatusBadge tone={checkedIn ? 'green' : 'blue'}>
                  {checkedIn ? 'Checked In' : 'Confirmed'}
                </StatusBadge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-page p-3 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-brand-navy/50">
                    Ticket Code
                  </span>
                  <span className="font-code font-bold text-brand-navy">{row.ticketCode}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-brand-navy/50">
                    Mobile
                  </span>
                  <span className="font-code font-semibold text-brand-navy">{row.mobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold uppercase text-brand-navy/50">
                    Registered At (Cebu)
                  </span>
                  <span className="text-brand-navy/80">{formatCebuDateTime(row.registeredAt)}</span>
                </div>
                {checkedIn && row.checkedInAt && (
                  <div className="col-span-2 text-status-green font-semibold">
                    Checked in at {formatCebuTime(row.checkedInAt)} (Cebu time)
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
