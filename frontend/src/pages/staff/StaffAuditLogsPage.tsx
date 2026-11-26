import { ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { SegmentedTabs } from '../../components/ui/SegmentedTabs'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge, type BadgeTone } from '../../components/ui/StatusBadge'
import { useAuditLogs, type AuditLogEntry } from '../../features/audit'
import { formatCebuDateTime } from '../../lib/formatDate'

type AuditCategory = 'all' | 'checkin' | 'undo' | 'events' | 'waitlist' | 'cancel'

const PAGE_SIZE = 15

function getActionBadge(action: string): { tone: BadgeTone; label: string } {
  switch (action) {
    case 'CHECK_IN':
      return { tone: 'green', label: 'Check-In' }
    case 'UNDO_CHECK_IN':
      return { tone: 'amber', label: 'Undo Check-In' }
    case 'PROMOTE_WAITLIST':
      return { tone: 'blue', label: 'Waitlist Promoted' }
    case 'CREATE_EVENT':
      return { tone: 'blue', label: 'Event Created' }
    case 'UPDATE_EVENT':
      return { tone: 'blue', label: 'Event Updated' }
    case 'CLOSE_EVENT':
      return { tone: 'neutral', label: 'Event Closed' }
    case 'DELETE_EVENT':
      return { tone: 'red', label: 'Event Deleted' }
    case 'STAFF_CANCEL':
      return { tone: 'red', label: 'Staff Cancel' }
    case 'ATTENDEE_CANCEL':
      return { tone: 'red', label: 'Self-Cancel' }
    default:
      return { tone: 'neutral', label: action }
  }
}

function getRoleBadge(role: string): { tone: BadgeTone; label: string } {
  if (role === 'ORGANIZER') return { tone: 'blue', label: 'Organizer' }
  if (role === 'DOOR_STAFF') return { tone: 'green', label: 'Door Staff' }
  return { tone: 'neutral', label: 'Attendee' }
}

function matchesCategory(entry: AuditLogEntry, category: AuditCategory): boolean {
  switch (category) {
    case 'checkin':
      return entry.action === 'CHECK_IN'
    case 'undo':
      return entry.action === 'UNDO_CHECK_IN'
    case 'events':
      return entry.entityType === 'EVENT'
    case 'waitlist':
      return entry.action === 'PROMOTE_WAITLIST'
    case 'cancel':
      return entry.action === 'STAFF_CANCEL' || entry.action === 'ATTENDEE_CANCEL'
    case 'all':
    default:
      return true
  }
}

export function StaffAuditLogsPage() {
  const { data: logs = [], isLoading, isError, error, refetch, isRefetching } = useAuditLogs()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AuditCategory>('all')
  const [page, setPage] = useState(1)

  const counts = useMemo(
    () => ({
      all: logs.length,
      checkin: logs.filter((l) => matchesCategory(l, 'checkin')).length,
      undo: logs.filter((l) => matchesCategory(l, 'undo')).length,
      events: logs.filter((l) => matchesCategory(l, 'events')).length,
      waitlist: logs.filter((l) => matchesCategory(l, 'waitlist')).length,
      cancel: logs.filter((l) => matchesCategory(l, 'cancel')).length,
    }),
    [logs],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs.filter((entry) => {
      if (!matchesCategory(entry, category)) return false
      if (!q) return true
      return (
        entry.action.toLowerCase().includes(q) ||
        entry.performedByName.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.entityType.toLowerCase().includes(q) ||
        String(entry.entityId).includes(q)
      )
    })
  }, [logs, category, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, category])

  const hasFilter = search.trim().length > 0 || category !== 'all'

  return (
    <div className="page-container animate-rise space-y-3 py-3 sm:space-y-4 sm:py-5">
      {/* Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone="blue" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Security &amp; Oversight
            </StatusBadge>
            {!isLoading && (
              <span className="rounded-full border border-border bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-brand-navy/75">
                {logs.length} recent {logs.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
          <h1 className="heading-hero font-heading mt-1.5 font-extrabold text-brand-navy">
            Audit Logs
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/75 sm:text-sm">
            Traceable record of event changes, waitlist promotions, door check-ins, undos, and cancellations in Cebu time.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-full bg-white/90 sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 shrink-0 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>{isRefetching ? 'Syncing…' : 'Sync'}</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="staff-surface-card space-y-2.5 rounded-[var(--radius-card)] p-3 sm:p-3.5">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search actor, action, ticket code, or event…"
              aria-label="Search audit logs"
              leftIcon={<Search className="h-4 w-4" />}
              className="min-h-[40px] text-base sm:text-sm"
            />
          </div>

          <div className="min-w-0 xl:shrink-0">
            <SegmentedTabs
              value={category}
              onChange={setCategory}
              ariaLabel="Filter audit logs by action"
              options={[
                { id: 'all', label: `All (${counts.all})` },
                { id: 'checkin', label: `Check-In (${counts.checkin})` },
                { id: 'undo', label: `Undo (${counts.undo})` },
                { id: 'waitlist', label: `Promote (${counts.waitlist})` },
                { id: 'cancel', label: `Cancel (${counts.cancel})` },
                { id: 'events', label: `Events (${counts.events})` },
              ]}
            />
          </div>
        </div>

        {hasFilter && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2 text-xs">
            <span className="text-brand-navy/75">
              Showing <strong className="text-brand-navy">{filtered.length}</strong> matching{' '}
              {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('all')
              }}
              className="inline-flex h-9 items-center gap-1 font-bold text-brand-primary hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
        {isLoading ? (
          <div className="p-8">
            <Spinner label="Loading audit trail..." />
          </div>
        ) : isError ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load audit logs">
              {error instanceof Error ? error.message : 'Unable to fetch audit trail.'}
            </Alert>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="p-6 sm:p-8">
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title={hasFilter ? 'No audit entries match your filter' : 'No audit logs recorded yet'}
              description={
                hasFilter
                  ? 'Try another search query or reset filters.'
                  : 'Staff actions such as check-ins, undos, promotions, and event updates appear here.'
              }
              action={
                hasFilter ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setCategory('all')
                    }}
                  >
                    Reset filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-page/70 text-[11px] font-extrabold uppercase tracking-wider text-brand-navy/65">
                  <tr>
                    <th className="px-4 py-3">When (Manila)</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Who</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {visibleRows.map((entry) => {
                    const actionBadge = getActionBadge(entry.action)
                    const roleBadge = getRoleBadge(entry.performedByRole)
                    return (
                      <tr key={entry.id} className="transition-colors hover:bg-page/45">
                        <td className="font-code whitespace-nowrap px-4 py-3 text-brand-navy/80">
                          {formatCebuDateTime(entry.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge tone={actionBadge.tone}>{actionBadge.label}</StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-brand-navy">{entry.performedByName}</span>
                            <StatusBadge tone={roleBadge.tone}>{roleBadge.label}</StatusBadge>
                          </div>
                        </td>
                        <td className="font-code whitespace-nowrap px-4 py-3 text-brand-navy/70">
                          {entry.entityType} #{entry.entityId}
                        </td>
                        <td className="px-4 py-3 text-brand-navy/85">{entry.details}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <ul className="divide-y divide-border/75 md:hidden">
              {visibleRows.map((entry) => {
                const actionBadge = getActionBadge(entry.action)
                const roleBadge = getRoleBadge(entry.performedByRole)
                return (
                  <li key={entry.id} className="space-y-1.5 p-3.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge tone={actionBadge.tone}>{actionBadge.label}</StatusBadge>
                      <span className="font-code text-[11px] text-brand-navy/65">
                        {formatCebuDateTime(entry.createdAt)}
                      </span>
                    </div>
                    <p className="font-medium text-brand-navy">{entry.details}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-brand-navy/70">
                      <span className="inline-flex items-center gap-1.5">
                        <strong className="text-brand-navy">{entry.performedByName}</strong>
                        <StatusBadge tone={roleBadge.tone}>{roleBadge.label}</StatusBadge>
                      </span>
                      <span className="font-code">
                        {entry.entityType} #{entry.entityId}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/75 bg-page/45 px-4 py-2.5 text-xs">
                <span className="text-brand-navy/70">
                  Page <strong className="text-brand-navy">{safePage}</strong> of{' '}
                  <strong className="text-brand-navy">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous audit log page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next audit log page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
