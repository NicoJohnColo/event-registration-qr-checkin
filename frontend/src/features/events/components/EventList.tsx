import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
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
  layout?: 'carousel' | 'grid'
  onRetry?: () => void
  onResetFilters?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

const DELAY_CLASSES = ['', 'delay-75', 'delay-150', 'delay-225']

function EventCardSkeleton({ carousel = false }: { carousel?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-border bg-surface shadow-card ${
        carousel ? 'w-[86%] shrink-0 snap-start sm:w-[340px] lg:w-[calc((100%-3rem)/3)]' : ''
      }`}
    >
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
  layout = 'carousel',
  onRetry,
  onResetFilters,
  emptyTitle = 'No matching events',
  emptyDescription = 'Try clearing your search or switching filters to view other Cebu events.',
}: EventListProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false })
  const [dragging, setDragging] = useState(false)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Keep active upcoming events ahead of past "Ended" events
  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        if (a.ended !== b.ended) return a.ended ? 1 : -1
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      }),
    [events],
  )

  const syncCarouselState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4)

    const firstCard = el.firstElementChild as HTMLElement | null
    if (firstCard) {
      const step = firstCard.getBoundingClientRect().width + 16
      if (step > 0) {
        setActiveIndex(Math.min(sorted.length - 1, Math.max(0, Math.round(scrollLeft / step))))
      }
    }
  }, [sorted.length])

  useEffect(() => {
    if (layout !== 'carousel') return
    syncCarouselState()
    window.addEventListener('resize', syncCarouselState)
    return () => window.removeEventListener('resize', syncCarouselState)
  }, [layout, syncCarouselState, sorted.length])

  const scrollByCard = (direction: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const firstCard = el.firstElementChild as HTMLElement | null
    const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 320
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  const scrollToIndex = (index: number) => {
    const el = trackRef.current
    if (!el) return
    const firstCard = el.firstElementChild as HTMLElement | null
    const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 320
    el.scrollTo({ left: index * step, behavior: 'smooth' })
  }

  // Desktop mouse drag-to-swipe (touch & pen use 100% native OS touch scrolling)
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !trackRef.current) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: trackRef.current.scrollLeft,
      moved: false,
    }
    setDragging(true)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !trackRef.current) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 6) {
      dragRef.current.moved = true
    }
    if (dragRef.current.moved) {
      trackRef.current.scrollLeft = dragRef.current.startScrollLeft - dx
    }
  }

  const endMouseDrag = () => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setDragging(false)
    window.setTimeout(() => {
      dragRef.current.moved = false
    }, 0)
  }

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (isLoading) {
    if (layout === 'carousel') {
      return (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-3" aria-label="Loading events">
          <EventCardSkeleton carousel />
          <EventCardSkeleton carousel />
          <EventCardSkeleton carousel />
        </div>
      )
    }
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

  if (sorted.length === 0) {
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

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
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

  return (
    <div className="relative">
      {/* Desktop Left & Right Side Arrows */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canPrev}
        aria-label="Previous event"
        className="absolute -left-4 top-[44%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand-navy shadow-dock backdrop-blur-sm transition-all duration-150 hover:scale-105 hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canNext}
        aria-label="Next event"
        className="absolute -right-4 top-[44%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-brand-navy shadow-dock backdrop-blur-sm transition-all duration-150 hover:scale-105 hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Horizontal Snap-Scroll Carousel Track (Mobile & Desktop) */}
      <div
        ref={trackRef}
        onScroll={syncCarouselState}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endMouseDrag}
        onPointerCancel={endMouseDrag}
        onPointerLeave={endMouseDrag}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={handleClickCapture}
        className={`no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain pb-2 [scroll-padding-inline:clamp(12px,3.8vw,24px)] [touch-action:pan-x_pan-y] [-webkit-overflow-scrolling:touch] sm:gap-4 sm:pb-3 md:gap-6 ${
          dragging
            ? 'cursor-grabbing snap-none select-none'
            : 'cursor-grab snap-x snap-mandatory'
        }`}
      >
        {sorted.map((event, idx) => (
          <div
            key={event.id}
            className="flex w-[74vw] max-w-[264px] shrink-0 snap-start sm:w-[340px] sm:max-w-none lg:w-[calc((100%-3rem)/3)] [&>*]:w-full"
          >
            <EventCard
              event={event}
              animationDelayClass={DELAY_CLASSES[idx % DELAY_CLASSES.length]}
            />
          </div>
        ))}
      </div>

      {/* Carousel Controls: sleek centered dots on phones, Prev/Next + dots on >=sm */}
      {sorted.length > 1 && (
        <div className="mt-1 flex items-center justify-center gap-2 sm:mt-2.5 sm:justify-between">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous event"
            className="hidden h-10 min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-surface px-3 text-xs font-bold text-brand-navy shadow-xs transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-0.5" role="tablist" aria-label="Event slides">
            {sorted.map((ev, idx) => (
              <button
                key={ev.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`Go to ${ev.title}`}
                onClick={() => scrollToIndex(idx)}
                className="inline-flex min-h-[24px] min-w-[20px] items-center justify-center px-0.5 sm:min-h-[40px] sm:min-w-[26px] sm:px-1"
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-200 sm:h-2 ${
                    idx === activeIndex
                      ? 'w-5 bg-brand-primary'
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
            className="hidden h-10 min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-surface px-3 text-xs font-bold text-brand-navy shadow-xs transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}
    </div>
  )
}
