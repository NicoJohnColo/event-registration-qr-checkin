import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { SegmentedTabs } from '../../components/ui/SegmentedTabs'
import { Spinner } from '../../components/ui/Spinner'
import {
  AttendeeTable,
  SearchBox,
  TotalsBar,
  WaitlistQueueBanner,
  useEventAttendees,
  usePromoteWaitlist,
  useStaffCancelRegistration,
  type AttendeeRow,
} from '../../features/attendees'
import { useAuth } from '../../features/auth'
import { EventSelector, readCheckInSession, useUndoCheckIn } from '../../features/checkin'
import { useEvents } from '../../features/events'
import { isTodayInManila } from '../../lib/formatDate'

type StatusFilter = 'all' | 'confirmed' | 'checked_in' | 'waitlisted' | 'cancelled'

export function AttendeeListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { staff } = useAuth()
  const isOrganizer = staff?.role === 'ORGANIZER'
  const routeEventId = id ? Number(id) : null

  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<number | null>(() => {
    if (routeEventId && Number.isFinite(routeEventId)) return routeEventId
    return readCheckInSession().selectedEventId
  })
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null)
  const [mutatingId, setMutatingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  const promoteMutation = usePromoteWaitlist()
  const cancelMutation = useStaffCancelRegistration()
  const undoMutation = useUndoCheckIn()

  useEffect(() => {
    if (routeEventId && Number.isFinite(routeEventId)) {
      setSelectedEventId(routeEventId)
    }
  }, [routeEventId])

  useEffect(() => {
    if (events.length === 0) return
    if (selectedEventId !== null && events.some((e) => e.id === selectedEventId)) return
    const todayEvent = events.find((e) => isTodayInManila(e.startsAt, e.endsAt))
    const fallback = events.find((e) => !e.ended) ?? events[0]
    setSelectedEventId((todayEvent ?? fallback).id)
  }, [events, selectedEventId])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchInput), 200)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const {
    data: roster,
    isLoading: rosterLoading,
    isFetching,
    isError: rosterError,
    error,
  } = useEventAttendees(selectedEventId, debouncedQuery)

  const visibleAttendees = useMemo(() => {
    const list = roster?.attendees ?? []
    switch (statusFilter) {
      case 'checked_in':
        return list.filter((a) => a.status === 'CHECKED_IN')
      case 'confirmed':
        return list.filter((a) => a.status === 'CONFIRMED')
      case 'waitlisted':
        return list
          .filter((a) => a.status === 'WAITLISTED')
          .sort((a, b) => (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999))
      case 'cancelled':
        return list.filter((a) => a.status === 'CANCELLED')
      case 'all':
      default:
        return list
    }
  }, [roster?.attendees, statusFilter])

  const handleEventChange = (nextEventId: number) => {
    setSelectedEventId(nextEventId)
    setConfirmCancelId(null)
    setFeedback(null)
    navigate(`/staff/events/${nextEventId}/attendees`, { replace: true })
  }

  const handlePromoteWaitlist = async () => {
    if (!selectedEventId) return
    setFeedback(null)
    try {
      const ticket = await promoteMutation.mutateAsync(selectedEventId)
      setFeedback({
        tone: 'success',
        message: `Promoted ${ticket.attendeeName} (${ticket.ticketCode}) from the waitlist to Confirmed.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Unable to promote waitlist attendee.',
      })
    }
  }

  const handleConfirmCancel = async (row: AttendeeRow) => {
    setFeedback(null)
    setMutatingId(row.id)
    try {
      await cancelMutation.mutateAsync(row.id)
      setConfirmCancelId(null)
      setFeedback({
        tone: 'success',
        message: `Cancelled ${row.fullName}'s registration (${row.ticketCode}).${
          row.status === 'CONFIRMED' ? ' Seat released.' : ''
        }`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Unable to cancel this registration.',
      })
    } finally {
      setMutatingId(null)
    }
  }

  const handleUndoCheckIn = async (row: AttendeeRow) => {
    if (!selectedEventId) return
    setFeedback(null)
    setMutatingId(row.id)
    try {
      await undoMutation.mutateAsync({ eventId: selectedEventId, ticketCode: row.ticketCode })
      setFeedback({
        tone: 'success',
        message: `Undid check-in for ${row.fullName} (${row.ticketCode}). Ticket returned to Confirmed.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Unable to undo check-in.',
      })
    } finally {
      setMutatingId(null)
    }
  }

  if (eventsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Spinner label="Loading events..." />
      </div>
    )
  }

  if (eventsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Alert tone="error" title="Could not load events">
          Unable to load events for the attendee roster.
        </Alert>
      </div>
    )
  }

  const allRows = roster?.attendees ?? []
  const checkedInVisible = allRows.filter((a) => a.status === 'CHECKED_IN').length
  const confirmedVisible = allRows.filter((a) => a.status === 'CONFIRMED').length
  const waitlistedRows = allRows
    .filter((a) => a.status === 'WAITLISTED')
    .sort((a, b) => (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999))
  const cancelledVisible = allRows.filter((a) => a.status === 'CANCELLED').length
  const firstWaitlist = waitlistedRows[0] ?? null

  return (
    <div className="page-container animate-rise space-y-3.5 py-4 sm:space-y-4 sm:py-6">
      {/* Header + Event Selector */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="heading-hero font-heading font-extrabold text-brand-navy">
            Attendee Roster
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/75 sm:text-sm">
            Registered attendees, waitlist queue, cancellations, and Cebu check-in status.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <EventSelector
            events={events}
            selectedEventId={selectedEventId}
            onChange={handleEventChange}
          />
        </div>
      </div>

      {/* Action Feedback */}
      {feedback && (
        <Alert
          tone={feedback.tone}
          title={feedback.tone === 'success' ? 'Roster Updated' : 'Action Failed'}
          action={
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-navy/60 hover:bg-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          }
        >
          {feedback.message}
        </Alert>
      )}

      {/* 3-Column Totals Strip */}
      {roster && (
        <TotalsBar
          registeredCount={roster.registeredCount}
          checkedInCount={roster.checkedInCount}
          capacity={roster.capacity}
        />
      )}

      {/* Waitlist Queue & Promotion Banner */}
      {roster && (
        <WaitlistQueueBanner
          waitlistedCount={waitlistedRows.length}
          firstWaitlist={firstWaitlist}
          capacity={roster.capacity}
          registeredCount={roster.registeredCount}
          isOrganizer={isOrganizer}
          isPromoting={promoteMutation.isPending}
          onPromote={handlePromoteWaitlist}
        />
      )}

      {/* One Unified Search + Filter + Table Container */}
      <div className="scroll-mt-16 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
        <div className="space-y-2.5 border-b border-border/80 bg-page/55 p-3 sm:p-3.5">
          <SearchBox
            value={searchInput}
            onChange={setSearchInput}
            totalVisible={visibleAttendees.length}
            isFetching={isFetching && !rosterLoading}
          />

          <SegmentedTabs
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter attendees by status"
            className="bg-surface"
            options={[
              { id: 'all', label: `All (${allRows.length})` },
              { id: 'confirmed', label: `Confirmed (${confirmedVisible})` },
              { id: 'checked_in', label: `Checked In (${checkedInVisible})` },
              { id: 'waitlisted', label: `Waitlist (${waitlistedRows.length})` },
              { id: 'cancelled', label: `Cancelled (${cancelledVisible})` },
            ]}
          />
        </div>

        {rosterLoading ? (
          <div className="p-8">
            <Spinner label="Loading attendees..." />
          </div>
        ) : rosterError ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load attendee list">
              {error instanceof Error ? error.message : 'Please try again.'}
            </Alert>
          </div>
        ) : roster ? (
          <AttendeeTable
            attendees={visibleAttendees}
            hasFilter={debouncedQuery.trim().length > 0 || statusFilter !== 'all'}
            isOrganizer={isOrganizer}
            mutatingId={mutatingId}
            confirmCancelId={confirmCancelId}
            onRequestCancel={setConfirmCancelId}
            onConfirmCancel={handleConfirmCancel}
            onUndoCheckIn={handleUndoCheckIn}
            onClearFilters={() => {
              setSearchInput('')
              setDebouncedQuery('')
              setStatusFilter('all')
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
