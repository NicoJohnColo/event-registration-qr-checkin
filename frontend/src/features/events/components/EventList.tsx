import { CalendarX2 } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { EventItem } from '../types'
import { EventCard } from './EventCard'

interface EventListProps {
  events: EventItem[]
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry?: () => void
  onResetFilters?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

const DELAY_CLASSES = ['', 'delay-75', 'delay-150', 'delay-225']

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
      <div className="h-1 w-full skeleton-shimmer" />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-13 w-13 rounded-2xl skeleton-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded skeleton-shimmer" />
          <div className="h-3.5 w-full rounded skeleton-shimmer" />
          <div className="h-3.5 w-5/6 rounded skeleton-shimmer" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-9 w-full rounded-xl skeleton-shimmer" />
          <div className="h-9 w-full rounded-xl skeleton-shimmer" />
        </div>
        <div className="space-y-3 border-t border-border/70 pt-4">
          <div className="h-2 w-full rounded-full skeleton-shimmer" />
          <div className="flex gap-2.5">
            <div className="h-9 flex-1 rounded-[12px] skeleton-shimmer" />
            <div className="h-9 flex-1 rounded-[12px] skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function EventList({
  events,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onResetFilters,
  emptyTitle = 'No matching events',
  emptyDescription = 'Try clearing your search or switching filters to view other Cebu events.',
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert
        tone="error"
        title="Could not load events"
        action={
          onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        {errorMessage || 'Please make sure the backend server is running.'}
      </Alert>
    )
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX2 className="h-6 w-6" />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          onResetFilters && (
            <Button variant="secondary" size="sm" onClick={onResetFilters}>
              Reset search &amp; filters
            </Button>
          )
        }
      />
    )
  }

  // Keep active upcoming events ahead of past "Ended" events
  const sorted = [...events].sort((a, b) => {
    if (a.ended !== b.ended) return a.ended ? 1 : -1
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  })

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sorted.map((event, idx) => (
        <EventCard
          key={event.id}
          event={event}
          animationDelayClass={DELAY_CLASSES[idx % DELAY_CLASSES.length]}
        />
      ))}
    </div>
  )
}
