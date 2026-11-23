import { Calendar, Clock, ScanLine, Users } from 'lucide-react'
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
          setRecentScans((prev) => [res, ...prev].slice(0, 6))
        },
      },
    )
  }

  if (eventsLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Spinner label="Loading check-in console..." />
      </div>
    )
  }

  if (eventsError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      {/* Control-room header bar */}
      <div className="flex flex-col justify-between gap-3 rounded-[20px] border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-black text-brand-navy sm:text-2xl">
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
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-navy/70">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                {formatCebuDate(selectedEvent.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand-primary" />
                {formatCebuTimeRange(selectedEvent.startsAt, selectedEvent.endsAt)}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {stats && (
            <div className="rounded-xl border border-brand-sky bg-sky-50/75 px-4 py-2 text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                Checked In
              </p>
              <p className="font-code text-lg font-extrabold text-brand-navy">
                {stats.checkedInCount} / {stats.registeredCount}
                <span className="ml-1.5 text-xs font-semibold text-brand-navy/60">
                  ({stats.capacity} cap)
                </span>
              </p>
            </div>
          )}

          {selectedEventId && (
            <Link
              to={`/staff/events/${selectedEventId}/attendees`}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-page px-3.5 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Attendee List</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Check-In Input Card */}
      <div className="space-y-5 rounded-[20px] border border-border bg-surface p-5 shadow-card sm:p-6">
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
      </div>

      {/* Hero Result Card (Green / Yellow / Red) */}
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
        <div className="rounded-[20px] border border-dashed border-border bg-surface/65 p-6 text-center">
          <ScanLine className="mx-auto h-7 w-7 text-brand-primary/60" />
          <p className="mt-2 text-sm font-bold text-brand-navy">Ready for door check-in</p>
          <p className="mt-0.5 text-xs text-brand-navy/65">
            Select the active event above and enter a ticket code (such as CDM-BES2VQ) to check in an attendee.
          </p>
        </div>
      )}

      {/* Compact Recent Scans Log */}
      {recentScans.length > 0 && (
        <div className="rounded-[20px] border border-border bg-surface p-4 shadow-xs sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy/60">
              Recent Scans This Session
            </h2>
            <button
              type="button"
              onClick={() => {
                setLastResult(null)
                setRecentScans([])
              }}
              className="text-xs font-bold text-brand-primary hover:underline"
            >
              Clear
            </button>
          </div>
          <ul className="mt-3 divide-y divide-border/70">
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
                      : 'Invalid Ticket'

              return (
                <li
                  key={`${scan.ticketCode}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-code font-bold text-brand-navy">{scan.ticketCode}</span>
                    {scan.attendeeName && (
                      <span className="font-semibold text-brand-navy/80">{scan.attendeeName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.checkedInAt && (
                      <span className="text-brand-navy/55">{formatCebuTime(scan.checkedInAt)}</span>
                    )}
                    <StatusBadge tone={badgeTone}>{badgeText}</StatusBadge>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
