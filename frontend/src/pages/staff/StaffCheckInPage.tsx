import { ArrowRight, Calendar, ChevronDown, ChevronUp, Clock, ScanLine, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { ResultBanner, type ResultTone } from '../../components/ui/ResultBanner'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  CheckInForm,
  EventSelector,
  readCheckInSession,
  saveCheckInSession,
  useCheckIn,
  useCheckInStats,
  type CheckInResponse,
} from '../../features/checkin'
import { useEvents } from '../../features/events'
import { formatCebuDate, formatCebuTime, formatCebuTimeRange, isTodayInManila } from '../../lib/formatDate'

function mapOutcomeToBanner(res: CheckInResponse): {
  tone: ResultTone
  label: string
  title: string
  detail: string
  meta: string | null
} {
  switch (res.outcome) {
    case 'CHECKED_IN':
      return {
        tone: 'green',
        label: 'Checked In',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.checkedInAt
          ? `Checked in at ${formatCebuTime(res.checkedInAt)} (Asia/Manila)`
          : 'Checked in successfully',
        meta: `Ticket ${res.ticketCode}${res.checkedInByName ? ` · Verified by ${res.checkedInByName}` : ''}`,
      }
    case 'ALREADY_CHECKED_IN':
      return {
        tone: 'yellow',
        label: 'Already Checked In',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.checkedInAt
          ? `First checked in at ${formatCebuTime(res.checkedInAt)} (Asia/Manila)`
          : 'This ticket has already checked in.',
        meta: `Ticket ${res.ticketCode}${res.checkedInByName ? ` · Original check-in by ${res.checkedInByName}` : ''}`,
      }
    case 'WRONG_DAY':
      return {
        tone: 'red',
        label: 'Not Event Day',
        title: res.attendeeName ?? res.ticketCode,
        detail: res.message,
        meta: `Ticket ${res.ticketCode} · Not checked in`,
      }
    case 'INVALID':
    default:
      return {
        tone: 'red',
        label: 'Invalid Ticket',
        title: res.ticketCode,
        detail: 'Ticket code was not found for the selected event.',
        meta: null,
      }
  }
}

export function StaffCheckInPage() {
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useEvents()
  const [initialSession] = useState(() => readCheckInSession())
  const [selectedEventId, setSelectedEventId] = useState<number | null>(initialSession.selectedEventId)
  const [scanCount, setScanCount] = useState(initialSession.recentScans.length)
  const [lastResult, setLastResult] = useState<CheckInResponse | null>(initialSession.lastResult)
  const [recentScans, setRecentScans] = useState<CheckInResponse[]>(initialSession.recentScans)
  const [historyOpenMobile, setHistoryOpenMobile] = useState(false)

  useEffect(() => {
    if (events.length === 0) return
    if (selectedEventId !== null && events.some((e) => e.id === selectedEventId)) return
    const todayEvent = events.find((e) => isTodayInManila(e.startsAt, e.endsAt))
    const fallbackEvent = events.find((e) => !e.ended) ?? events[0]
    setSelectedEventId((todayEvent ?? fallbackEvent).id)
  }, [events, selectedEventId])

  useEffect(() => {
    saveCheckInSession({ selectedEventId, lastResult, recentScans })
  }, [selectedEventId, lastResult, recentScans])

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )

  const { data: stats } = useCheckInStats(selectedEventId)
  const checkInMutation = useCheckIn()

  const handleEventChange = (nextEventId: number) => {
    setSelectedEventId(nextEventId)
    setLastResult(null)
    checkInMutation.reset()
  }

  const handleSubmitCode = (ticketCode: string) => {
    if (!selectedEventId) return
    checkInMutation.mutate(
      { eventId: selectedEventId, ticketCode },
      {
        onSuccess: (res) => {
          setLastResult(res)
          setScanCount((c) => c + 1)
          setRecentScans((prev) => [res, ...prev].slice(0, 12))
        },
      },
    )
  }

  if (eventsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Spinner label="Loading check-in console..." />
      </div>
    )
  }

  if (eventsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Alert tone="error" title="Could not load events">
          Unable to load the event list for check-in. Please refresh the page.
        </Alert>
      </div>
    )
  }

  const isSelectedEventToday =
    selectedEvent !== null && isTodayInManila(selectedEvent.startsAt, selectedEvent.endsAt)
  const banner = lastResult ? mapOutcomeToBanner(lastResult) : null

  return (
    <div className="page-container animate-rise py-4 sm:py-6">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* Main Unified Check-In Workspace */}
        <section className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card lg:col-span-7">
          {/* Top Status Header: badge wraps below title on narrow phones; Checked In chip is full-width on mobile */}
          <div className="flex flex-col gap-2.5 border-b border-border/80 bg-page/65 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0">
              <div className="flex flex-col items-start gap-1.5 xs:flex-row xs:flex-wrap xs:items-center xs:gap-2">
                <h1 className="heading-hero font-heading font-extrabold text-brand-navy">
                  Door Check-In
                </h1>
                {selectedEvent && (
                  <StatusBadge tone={isSelectedEventToday ? 'green' : 'amber'}>
                    {isSelectedEventToday
                      ? 'Event Day Open'
                      : `Scheduled: ${formatCebuDate(selectedEvent.startsAt)}`}
                  </StatusBadge>
                )}
              </div>
              {selectedEvent && (
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-brand-navy/75">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                    <span>{formatCebuDate(selectedEvent.startsAt)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                    <span>{formatCebuTimeRange(selectedEvent.startsAt, selectedEvent.endsAt)}</span>
                  </span>
                </p>
              )}
            </div>

            {stats && (
              <div className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border border-brand-sky bg-sky-50 px-3 py-2 sm:w-auto sm:block sm:py-1.5 sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                  Checked In
                </p>
                <p className="font-code text-sm font-extrabold tabular-nums text-brand-navy sm:text-base">
                  {stats.checkedInCount} / {stats.registeredCount}
                  <span className="ml-1 text-xs font-semibold text-brand-navy/70">
                    ({stats.capacity} cap)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Form + Result Banner Flow */}
          <div className="space-y-3.5 p-3.5 sm:space-y-4 sm:p-4">
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onChange={handleEventChange}
            />

            <CheckInForm
              onSubmitCode={handleSubmitCode}
              isPending={checkInMutation.isPending}
              disabled={!selectedEventId}
            />

            {checkInMutation.isError && (
              <Alert tone="error" title="Check-in request failed">
                {checkInMutation.error instanceof Error
                  ? checkInMutation.error.message
                  : 'Unable to verify ticket right now.'}
              </Alert>
            )}

            {banner ? (
              <ResultBanner
                key={`${scanCount}-${lastResult?.ticketCode}-${lastResult?.outcome}`}
                tone={banner.tone}
                label={banner.label}
                title={banner.title}
                detail={banner.detail}
                meta={banner.meta}
              />
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-page/60 p-4 text-center">
                <ScanLine className="mx-auto h-5 w-5 text-brand-primary/65" />
                <p className="mt-1 text-sm font-bold text-brand-navy">Ready for door check-in</p>
                <p className="mt-0.5 text-xs text-brand-navy/70">
                  Select an event and enter or scan a ticket code above to verify entry.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Shift Activity Sidebar (Collapsible on Mobile to eliminate scrolling) */}
        <aside className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card lg:col-span-5">
          <div className="flex items-center justify-between gap-2 border-b border-border/80 bg-page/65 px-3.5 py-2.5 sm:px-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy/80">
                Recent Scans ({recentScans.length})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {recentScans.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLastResult(null)
                    setRecentScans([])
                  }}
                  className="inline-flex h-10 min-h-[40px] items-center px-2 text-xs font-bold text-brand-primary hover:underline"
                >
                  Clear
                </button>
              )}

              {recentScans.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistoryOpenMobile((prev) => !prev)}
                  className="inline-flex h-10 min-h-[40px] items-center gap-1 rounded-[var(--radius-control)] border border-border bg-surface px-2.5 text-xs font-bold text-brand-navy lg:hidden"
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
                  const badgeTone =
                    scan.outcome === 'CHECKED_IN'
                      ? 'green'
                      : scan.outcome === 'ALREADY_CHECKED_IN'
                        ? 'amber'
                        : 'red'
                  const badgeText =
                    scan.outcome === 'CHECKED_IN'
                      ? 'Checked In'
                      : scan.outcome === 'ALREADY_CHECKED_IN'
                        ? 'Already Checked In'
                        : scan.outcome === 'WRONG_DAY'
                          ? 'Wrong Day'
                          : 'Invalid'

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
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <StatusBadge tone={badgeTone}>{badgeText}</StatusBadge>
                        {scan.checkedInAt && (
                          <span className="text-xs text-brand-navy/70">
                            {formatCebuTime(scan.checkedInAt)}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selectedEventId && (
            <div className="border-t border-border/80 bg-page/55 p-3 sm:px-4">
              <Link
                to={`/staff/events/${selectedEventId}/attendees`}
                className="flex h-[var(--control-h)] min-h-[40px] w-full items-center justify-between rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-primary" />
                  <span>Open Attendee Roster</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
