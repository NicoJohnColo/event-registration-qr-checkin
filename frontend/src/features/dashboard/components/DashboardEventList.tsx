import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useHorizontalCarousel } from '../../../lib/useHorizontalCarousel'
import type { EventMetrics } from '../api'
import { DashboardEventCard } from './DashboardEventCard'
import type { DashboardViewMode } from './DashboardToolbar'

interface DashboardEventListProps {
  events: EventMetrics[]
  viewMode: DashboardViewMode
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onExportCsv: (event: EventMetrics) => void
  exportingId: number | null
  hasActiveFilters: boolean
  onResetFilters: () => void
}

const DELAY_CLASSES = ['', 'delay-75', 'delay-150', 'delay-225']

function DashboardCardSkeleton({ carousel = false }: { carousel?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card ${
        carousel
          ? 'w-[68vw] max-w-[238px] shrink-0 snap-start sm:w-[330px] sm:max-w-none lg:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]'
          : ''
      }`}
    >
      <div className="h-1 w-full skeleton-shimmer" />
      <div className="space-y-3 p-3.5 sm:p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-[10px] skeleton-shimmer" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded skeleton-shimmer" />
            <div className="h-4 w-24 rounded-full skeleton-shimmer" />
          </div>
        </div>
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-12 w-full rounded-[var(--radius-control)] skeleton-shimmer" />
        <div className="h-16 w-full rounded-[var(--radius-control)] skeleton-shimmer" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-[var(--radius-control)] skeleton-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-10 rounded-[var(--radius-control)] skeleton-shimmer" />
          <div className="h-10 rounded-[var(--radius-control)] skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

export function DashboardEventList({
  events,
  viewMode,
  isLoading,
  isError,
  onRetry,
  onExportCsv,
  exportingId,
  hasActiveFilters,
  onResetFilters,
}: DashboardEventListProps) {
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
    itemCount: events.length,
    isActive: viewMode === 'carousel',
  })

  if (isLoading) {
    if (viewMode === 'carousel') {
      return (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 md:gap-4" aria-label="Loading dashboard">
          <DashboardCardSkeleton carousel />
          <DashboardCardSkeleton carousel />
          <DashboardCardSkeleton carousel />
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-3" aria-label="Loading dashboard">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert
        tone="error"
        title="Could not load dashboard metrics"
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Unable to reach the backend server. Verify it is running and try again.
      </Alert>
    )
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX2 className="h-6 w-6" />}
        title={hasActiveFilters ? 'No matching events' : 'No events yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search keyword or switching status filter tabs.'
            : 'Create an event from Manage Events to start tracking attendance metrics.'
        }
        action={
          hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={onResetFilters} className="min-h-[40px]">
              Clear search &amp; filters
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-3">
        {events.map((event, idx) => (
          <DashboardEventCard
            key={event.eventId}
            event={event}
            onExportCsv={onExportCsv}
            isExporting={exportingId === event.eventId}
            animationDelayClass={DELAY_CLASSES[idx % DELAY_CLASSES.length]}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Desktop Left & Right Side Arrows */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canPrev}
        aria-label="Previous event"
        className="absolute -left-4 top-[45%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand-navy shadow-dock backdrop-blur-sm transition-all duration-150 hover:scale-105 hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canNext}
        aria-label="Next event"
        className="absolute -right-4 top-[45%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand-navy shadow-dock backdrop-blur-sm transition-all duration-150 hover:scale-105 hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Horizontal Snap-Scroll Carousel Track (Mobile-first with peek of next card) */}
      <div
        ref={trackRef}
        {...trackProps}
        className={`no-scrollbar flex gap-2.5 overflow-x-auto overscroll-x-contain pb-1 [scroll-padding-inline:2px] [touch-action:pan-x_pan-y] [-webkit-overflow-scrolling:touch] sm:gap-3 sm:pb-1.5 md:gap-4 ${
          dragging
            ? 'cursor-grabbing snap-none select-none'
            : 'cursor-grab snap-x snap-mandatory'
        }`}
      >
        {events.map((event, idx) => (
          <div
            key={event.eventId}
            className="flex w-[68vw] max-w-[238px] shrink-0 snap-start sm:w-[330px] sm:max-w-none lg:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
          >
            <DashboardEventCard
              event={event}
              onExportCsv={onExportCsv}
              isExporting={exportingId === event.eventId}
              animationDelayClass={DELAY_CLASSES[idx % DELAY_CLASSES.length]}
            />
          </div>
        ))}
      </div>

      {/* Bottom Carousel Navigation Controls */}
      {events.length > 1 && (
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

          <div className="flex items-center gap-1.5" role="tablist" aria-label="Dashboard event slides">
            {events.map((ev, idx) => (
              <button
                key={ev.eventId}
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
  )
}
