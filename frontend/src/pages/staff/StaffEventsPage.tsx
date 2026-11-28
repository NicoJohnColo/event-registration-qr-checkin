import { Calendar, CalendarX2, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  DashboardToolbar,
  type DashboardStatusFilter,
  type DashboardViewMode,
} from '../../features/dashboard'
import {
  EventFormModal,
  StaffEventCard,
  useCloseEvent,
  useDeleteEvent,
  useStaffEvents,
  useUpdateEvent,
  type StaffEventItem,
} from '../../features/events'
import { useHorizontalCarousel } from '../../lib/useHorizontalCarousel'

const DELAY_CLASSES = ['', 'delay-75', 'delay-150', 'delay-225']

export function StaffEventsPage() {
  const { data: events = [], isLoading, isError, refetch } = useStaffEvents()
  const updateMutation = useUpdateEvent()
  const closeMutation = useCloseEvent()
  const deleteMutation = useDeleteEvent()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('all')
  const [viewMode, setViewMode] = useState<DashboardViewMode>('carousel')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<StaffEventItem | null>(null)
  const [mutatingEventId, setMutatingEventId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  const counts = useMemo(
    () => ({
      all: events.length,
      published: events.filter((e) => e.status === 'PUBLISHED').length,
      draft: events.filter((e) => e.status === 'DRAFT').length,
      closed: events.filter((e) => e.status === 'CLOSED').length,
    }),
    [events],
  )

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = events.filter((event) => {
      if (statusFilter === 'published' && event.status !== 'PUBLISHED') return false
      if (statusFilter === 'draft' && event.status !== 'DRAFT') return false
      if (statusFilter === 'closed' && event.status !== 'CLOSED') return false
      if (!q) return true
      return (
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.codePrefix.toLowerCase().includes(q)
      )
    })

    return [...filtered].sort((a, b) => {
      const aDone = a.ended || a.status === 'CLOSED'
      const bDone = b.ended || b.status === 'CLOSED'
      if (aDone !== bDone) return aDone ? 1 : -1
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    })
  }, [events, search, statusFilter])

  const {
    trackRef,
    dragging,
    canPrev,
    canNext,
    activeIndex,
    scrollByCard,
    scrollToIndex,
    trackProps,
  } = useHorizontalCarousel({
    itemCount: filteredEvents.length,
    isActive: viewMode === 'carousel',
  })

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const handleOpenCreate = () => {
    setEditingEvent(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (ev: StaffEventItem) => {
    setEditingEvent(ev)
    setModalOpen(true)
  }

  const handlePublish = async (ev: StaffEventItem) => {
    setFeedback(null)
    setMutatingEventId(ev.id)
    try {
      await updateMutation.mutateAsync({
        id: ev.id,
        payload: {
          title: ev.title,
          description: ev.description,
          venue: ev.venue,
          startsAt: ev.startsAt,
          endsAt: ev.endsAt,
          capacity: ev.capacity,
          status: 'PUBLISHED',
          codePrefix: ev.codePrefix,
        },
      })
      setFeedback({
        tone: 'success',
        message: `"${ev.title}" is now Published and visible to attendees.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Unable to publish event.',
      })
    } finally {
      setMutatingEventId(null)
    }
  }

  const handleCloseEvent = async (ev: StaffEventItem) => {
    setFeedback(null)
    setMutatingEventId(ev.id)
    try {
      await closeMutation.mutateAsync(ev.id)
      setFeedback({
        tone: 'success',
        message: `"${ev.title}" has been Closed. New registrations are stopped.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Unable to close event.',
      })
    } finally {
      setMutatingEventId(null)
    }
  }

  const handleDeleteEvent = async (ev: StaffEventItem) => {
    setFeedback(null)
    setMutatingEventId(ev.id)
    try {
      await deleteMutation.mutateAsync(ev.id)
      setFeedback({
        tone: 'success',
        message: `"${ev.title}" has been permanently deleted.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Unable to delete event.',
      })
    } finally {
      setMutatingEventId(null)
    }
  }

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== 'all'

  return (
    <div className="page-container animate-rise space-y-2.5 py-2.5 sm:space-y-4 sm:py-5">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-2 sm:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone="blue" icon={<Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}>
              Organizer Tools
            </StatusBadge>
            {!isLoading && (
              <span className="rounded-full border border-border bg-white/90 px-2 py-0.5 text-[10px] font-bold text-brand-navy/75 sm:px-2.5 sm:text-[11px]">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            )}
          </div>
          <h1 className="heading-hero font-heading mt-1 font-extrabold text-brand-navy sm:mt-1.5">
            Manage Events
          </h1>
          <p className="mt-0.5 hidden text-xs leading-relaxed text-brand-navy/75 sm:block sm:text-sm">
            Create draft events, publish schedules to attendees, adjust capacity, close, or delete events.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          className="shrink-0 sm:h-9.5 sm:px-3.5 sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span>New Event</span>
        </Button>
      </div>

      {feedback && (
        <Alert tone={feedback.tone}>
          <div className="flex items-center justify-between gap-2">
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        </Alert>
      )}

      {/* Search, Filter Tabs & View Toggle */}
      <DashboardToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        counts={counts}
        totalMatching={filteredEvents.length}
        onReset={resetFilters}
      />

      {/* Event List: Loading / Error / Empty / Grid / Mobile Carousel */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-3" aria-label="Loading events">
          {[0, 1, 2].map((i) => (
            <div key={i} className="staff-surface-card h-[310px] rounded-[var(--radius-card)] p-4">
              <div className="h-10 w-36 rounded skeleton-shimmer" />
              <div className="mt-3 h-5 w-3/4 rounded skeleton-shimmer" />
              <div className="mt-3 h-14 w-full rounded skeleton-shimmer" />
              <div className="mt-3 h-16 w-full rounded skeleton-shimmer" />
              <div className="mt-4 h-10 w-full rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert
          tone="error"
          title="Could not load organizer events"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Please ensure the backend is running and you are signed in as an organizer.
        </Alert>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="h-6 w-6" />}
          title={hasActiveFilters ? 'No matching events' : 'No events created yet'}
          description={
            hasActiveFilters
              ? 'Try clearing your search or switching event status tabs.'
              : 'Create your first Cebu event to generate QR passes and open registration.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" size="md" onClick={resetFilters}>
                Clear search &amp; filters
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                <span>New Event</span>
              </Button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((ev, idx) => (
            <StaffEventCard
              key={ev.id}
              event={ev}
              onEdit={handleOpenEdit}
              onPublish={handlePublish}
              onCloseEvent={handleCloseEvent}
              onDeleteEvent={handleDeleteEvent}
              isMutating={mutatingEventId === ev.id}
              animationDelayClass={DELAY_CLASSES[idx % DELAY_CLASSES.length]}
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous event"
            className="absolute -left-4 top-[45%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand-navy shadow-dock backdrop-blur-sm transition-all hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-0 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next event"
            className="absolute -right-4 top-[45%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand-navy shadow-dock backdrop-blur-sm transition-all hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-0 md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={trackRef}
            {...trackProps}
            className={`no-scrollbar flex gap-2.5 overflow-x-auto overscroll-x-contain pb-1 [scroll-padding-inline:2px] [-webkit-overflow-scrolling:touch] [touch-action:pan-x_pan-y] sm:gap-3 sm:pb-1.5 md:gap-4 ${
              dragging
                ? 'cursor-grabbing snap-none select-none'
                : 'cursor-grab snap-x snap-mandatory'
            }`}
          >
            {filteredEvents.map((ev, idx) => (
              <div
                key={ev.id}
                className="flex w-[68vw] max-w-[238px] shrink-0 snap-start sm:w-[330px] sm:max-w-none lg:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
              >
                <StaffEventCard
                  event={ev}
                  onEdit={handleOpenEdit}
                  onPublish={handlePublish}
                  onCloseEvent={handleCloseEvent}
                  onDeleteEvent={handleDeleteEvent}
                  isMutating={mutatingEventId === ev.id}
                  animationDelayClass={DELAY_CLASSES[idx % DELAY_CLASSES.length]}
                />
              </div>
            ))}
          </div>

          {filteredEvents.length > 1 && (
            <div className="mt-1.5 flex items-center justify-center gap-2.5 sm:mt-2 sm:justify-between">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
                aria-label="Previous event"
                className="hidden h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-surface px-3 text-xs font-bold text-brand-navy shadow-xs transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
              >
                <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Manage events slides">
                {filteredEvents.map((ev, idx) => (
                  <button
                    key={ev.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeIndex}
                    aria-label={`View ${ev.title}`}
                    onClick={() => scrollToIndex(idx)}
                    className="inline-flex h-6 min-w-[18px] items-center justify-center px-0.5 sm:h-8 sm:min-w-[24px] sm:px-1"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all duration-200 sm:h-2 ${
                        idx === activeIndex
                          ? 'w-4 bg-brand-primary sm:w-5'
                          : 'w-1.5 bg-brand-navy/25 hover:bg-brand-navy/45 sm:w-2'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
                aria-label="Next event"
                className="hidden h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-surface px-3 text-xs font-bold text-brand-navy shadow-xs transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <EventFormModal
        open={modalOpen}
        event={editingEvent}
        onClose={() => setModalOpen(false)}
        onSaved={(saved, mode) => {
          setFeedback({
            tone: 'success',
            message:
              mode === 'create'
                ? `Created "${saved.title}" (${saved.status}).`
                : `Updated "${saved.title}" (${saved.status}).`,
          })
        }}
      />
    </div>
  )
}
