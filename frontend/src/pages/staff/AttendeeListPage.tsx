import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { SegmentedTabs } from '../../components/ui/SegmentedTabs'
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

type StatusFilter = 'all' | 'checked_in' | 'confirmed'

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

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
    if (statusFilter === 'checked_in') return list.filter((a) => a.status === 'CHECKED_IN')
    if (statusFilter === 'confirmed') return list.filter((a) => a.status === 'CONFIRMED')
    return list
  }, [roster?.attendees, statusFilter])

  const handleEventChange = (nextEventId: number) => {
    setSelectedEventId(nextEventId)
    navigate(`/staff/events/${nextEventId}/attendees`, { replace: true })
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

  return (
    <div className="page-container animate-rise space-y-3.5 py-4 sm:space-y-4 sm:py-6">
      {/* Header + Event Selector */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="heading-hero font-heading font-extrabold text-brand-navy">
            Attendee Roster
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/75 sm:text-sm">
            Registered attendees, ticket codes, and Cebu check-in status.
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

      {/* 3-Column Totals Strip */}
      {roster && (
        <TotalsBar
          registeredCount={roster.registeredCount}
          checkedInCount={roster.checkedInCount}
          capacity={roster.capacity}
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
            equalWidth
            options={[
              { id: 'all', label: `All (${allRows.length})` },
              { id: 'checked_in', label: `Checked In (${checkedInVisible})` },
              { id: 'confirmed', label: `Pending (${confirmedVisible})` },
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
