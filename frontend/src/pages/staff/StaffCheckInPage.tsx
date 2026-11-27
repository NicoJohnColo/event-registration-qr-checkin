import { Calendar, Camera, CameraOff, Clock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  CameraQrScanner,
  CheckInForm,
  CheckInOutcomePanel,
  EventSelector,
  RecentScansPanel,
  readCheckInSession,
  saveCheckInSession,
  useCheckIn,
  useCheckInStats,
  useUndoCheckIn,
  type CheckInResponse,
} from '../../features/checkin'
import { useEvents } from '../../features/events'
import { formatCebuDate, formatCebuTimeRange, isTodayInManila } from '../../lib/formatDate'

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
  const undoMutation = useUndoCheckIn()
  const [undoingCode, setUndoingCode] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  const handleEventChange = (nextEventId: number) => {
    setSelectedEventId(nextEventId)
    setLastResult(null)
    checkInMutation.reset()
    undoMutation.reset()
  }

  const handleSubmitCode = (ticketCode: string) => {
    if (!selectedEventId) return
    undoMutation.reset()
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

  const handleUndoCheckIn = (ticketCode: string) => {
    if (!selectedEventId) return
    setUndoingCode(ticketCode)
    undoMutation.mutate(
      { eventId: selectedEventId, ticketCode },
      {
        onSuccess: (res) => {
          setLastResult(res)
          setScanCount((c) => c + 1)
          setRecentScans((prev) =>
            prev.map((item) =>
              item.ticketCode === res.ticketCode
                ? {
                    ...item,
                    outcome: res.outcome,
                    message: res.message,
                    checkedInAt: null,
                    checkedInByName: null,
                  }
                : item,
            ),
          )
        },
        onSettled: () => {
          setUndoingCode(null)
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

  return (
    <div className="page-container animate-rise py-3 sm:py-6">
      <div className="grid grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Main Unified Check-In Workspace */}
        <section className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card lg:col-span-7">
          <div className="flex flex-col gap-2 border-b border-border/80 bg-page/65 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
                <h1 className="heading-section font-heading font-extrabold text-brand-navy sm:text-[1.375rem]">
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
                <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-brand-navy/75 sm:text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0 text-brand-primary sm:h-3.5 sm:w-3.5" />
                    <span>{formatCebuDate(selectedEvent.startsAt)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0 text-brand-primary sm:h-3.5 sm:w-3.5" />
                    <span>{formatCebuTimeRange(selectedEvent.startsAt, selectedEvent.endsAt)}</span>
                  </span>
                </p>
              )}
            </div>

            {stats && (
              <div className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border border-brand-sky bg-sky-50 px-2.5 py-1.5 sm:w-auto sm:block sm:px-3 sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary sm:text-[11px]">
                  Checked In
                </p>
                <p className="font-code text-xs font-extrabold tabular-nums text-brand-navy sm:text-base">
                  {stats.checkedInCount} / {stats.registeredCount}
                  <span className="ml-1 text-[10.5px] font-semibold text-brand-navy/70 sm:text-xs">
                    ({stats.capacity} cap)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Compact Aligned Check-In Workspace */}
          <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onChange={handleEventChange}
            />

            <CheckInForm
              onSubmitCode={handleSubmitCode}
              isPending={checkInMutation.isPending}
              disabled={!selectedEventId}
              headerAction={
                <Button
                  type="button"
                  variant={cameraOpen ? 'secondary' : 'outline'}
                  size="sm"
                  disabled={!selectedEventId}
                  onClick={() => setCameraOpen((prev) => !prev)}
                  className={`!h-7 px-2 text-[11px] sm:!h-7.5 sm:px-2.5 ${cameraOpen ? '' : 'bg-white'}`}
                >
                  {cameraOpen ? (
                    <>
                      <CameraOff className="h-3 w-3 text-brand-primary sm:h-3.5 sm:w-3.5" />
                      <span>Hide Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-3 w-3 text-brand-primary sm:h-3.5 sm:w-3.5" />
                      <span>Scan Camera</span>
                    </>
                  )}
                </Button>
              }
            />

            <CameraQrScanner
              active={cameraOpen}
              disabled={!selectedEventId}
              onClose={() => setCameraOpen(false)}
              onScanPayload={handleSubmitCode}
            />

            {checkInMutation.isError && (
              <Alert tone="error" title="Check-in request failed">
                {checkInMutation.error instanceof Error
                  ? checkInMutation.error.message
                  : 'Unable to verify ticket right now.'}
              </Alert>
            )}

            {undoMutation.isError && (
              <Alert tone="error" title="Undo check-in failed">
                {undoMutation.error instanceof Error
                  ? undoMutation.error.message
                  : 'Unable to undo check-in right now.'}
              </Alert>
            )}

            <CheckInOutcomePanel
              scanCount={scanCount}
              lastResult={lastResult}
              isUndoing={undoMutation.isPending}
              undoingCode={undoingCode}
              onUndo={handleUndoCheckIn}
            />
          </div>
        </section>

        <RecentScansPanel
          recentScans={recentScans}
          selectedEventId={selectedEventId}
          isUndoing={undoMutation.isPending}
          onClear={() => {
            setLastResult(null)
            setRecentScans([])
          }}
          onUndo={handleUndoCheckIn}
        />
      </div>
    </div>
  )
}
