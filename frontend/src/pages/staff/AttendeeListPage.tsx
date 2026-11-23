import { ScanLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Spinner } from '../../components/ui/Spinner'
import {
  AttendeeTable,
  SearchBox,
  TotalsBar,
  useEventAttendees,
} from '../../features/attendees'
import { EventSelector, readCheckInSession } from '../../features/checkin'
import { useEvents } from '../../features/events'
import { isTodayInManila } from '../../lib/formatDate'

export function AttendeeListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routeEventId = id ? Number(id) : null

  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState<number | null>(() => {
    if (routeEventId && Number.isFinite(routeEventId)) return routeEventId
    return readCheckInSession().selectedEventId
  })
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

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

  const handleEventChange = (nextEventId: number) => {
    setSelectedEventId(nextEventId)
    navigate(`/staff/events/${nextEventId}/attendees`, { replace: true })
  }

  if (eventsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Spinner label="Loading events..." />
      </div>
    )
  }

  if (eventsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Alert tone="error" title="Could not load events">
          Unable to load events for the attendee roster.
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Control Header */}
      <div className="flex flex-col justify-between gap-4 rounded-[20px] border border-border bg-surface p-5 shadow-card lg:flex-row lg:items-end">
        <div>
          <h1 className="font-heading text-xl font-black text-brand-navy sm:text-2xl">
            Attendee Roster
          </h1>
          <p className="mt-0.5 text-xs text-brand-navy/65 sm:text-sm">
            Live registered attendees, ticket codes, and Cebu check-in status per event.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-80">
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onChange={handleEventChange}
            />
          </div>
          <Link
            to="/staff/check-in"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[12px] border border-brand-sky-end bg-sky-50 px-4 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-sky/60"
          >
            <ScanLine className="h-4 w-4 text-brand-primary" />
            <span>Door Check-In</span>
          </Link>
        </div>
      </div>

      {roster && (
        <TotalsBar
          registeredCount={roster.registeredCount}
          checkedInCount={roster.checkedInCount}
          capacity={roster.capacity}
        />
      )}

      <div className="rounded-[20px] border border-border bg-surface p-4 shadow-card sm:p-5">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          totalVisible={roster?.attendees.length ?? 0}
          isFetching={isFetching && !rosterLoading}
        />
      </div>

      {rosterLoading ? (
        <Spinner label="Loading attendees..." />
      ) : rosterError ? (
        <Alert tone="error" title="Could not load attendee list">
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      ) : roster ? (
        <AttendeeTable
          attendees={roster.attendees}
          hasSearch={debouncedQuery.trim().length > 0}
          onClearSearch={() => {
            setSearchInput('')
            setDebouncedQuery('')
          }}
        />
      ) : null}
    </div>
  )
}
