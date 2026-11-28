import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

export interface SegmentedTabOption<T extends string> {
  id: T
  label: ReactNode
  icon?: ReactNode
}

interface SegmentedTabsProps<T extends string> {
  options: readonly SegmentedTabOption<T>[]
  value: T
  onChange: (id: T) => void
  ariaLabel?: string
  className?: string
  equalWidth?: boolean
  fitMobile?: boolean
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = 'bg-page',
  equalWidth = false,
  fitMobile = false,
}: SegmentedTabsProps<T>) {
  const scrollable = !equalWidth && !fitMobile
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false })

  const [dragging, setDragging] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const syncScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el || !scrollable) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      setHasOverflow(false)
      return
    }
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflowing = scrollWidth > clientWidth + 2
    setHasOverflow(overflowing)
    setCanScrollLeft(overflowing && scrollLeft > 4)
    setCanScrollRight(overflowing && scrollLeft + clientWidth < scrollWidth - 4)
  }, [scrollable])

  useEffect(() => {
    syncScrollState()
    const el = trackRef.current
    if (!scrollable || !el) return

    window.addEventListener('resize', syncScrollState)
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncScrollState) : null
    observer?.observe(el)

    return () => {
      window.removeEventListener('resize', syncScrollState)
      observer?.disconnect()
    }
  }, [scrollable, syncScrollState, options])

  const scrollStrip = (direction: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * 140, behavior: 'smooth' })
  }

  const endPointerDrag = () => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setDragging(false)
    window.setTimeout(() => {
      dragRef.current.moved = false
    }, 0)
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!scrollable || e.pointerType === 'touch' || e.button !== 0 || !trackRef.current) return
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
    if (Math.abs(dx) > 4) {
      dragRef.current.moved = true
    }
    if (dragRef.current.moved) {
      trackRef.current.scrollLeft = dragRef.current.startScrollLeft - dx
    }
  }

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (scrollable) e.preventDefault()
  }

  const equalGridClass =
    options.length === 4 ? 'grid-cols-4' : options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className="relative min-w-0 w-full">
      {scrollable && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollStrip(-1)}
          aria-label="Scroll filter options left"
          className="absolute inset-y-0.5 left-0.5 z-10 inline-flex w-6 items-center justify-start rounded-l-[var(--radius-control)] bg-gradient-to-r from-white via-white/90 to-transparent pl-0.5 text-brand-navy/75 hover:text-brand-primary focus-visible:outline-none"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        </button>
      )}

      <div
        ref={trackRef}
        onScroll={scrollable ? syncScrollState : undefined}
        onPointerDown={scrollable ? handlePointerDown : undefined}
        onPointerMove={scrollable ? handlePointerMove : undefined}
        onPointerUp={scrollable ? endPointerDrag : undefined}
        onPointerCancel={scrollable ? endPointerDrag : undefined}
        onPointerLeave={scrollable ? endPointerDrag : undefined}
        onDragStart={handleDragStart}
        onClickCapture={scrollable ? handleClickCapture : undefined}
        className={`no-scrollbar rounded-[var(--radius-control)] border border-border/80 p-0.5 sm:p-1 ${
          equalWidth
            ? `grid ${equalGridClass} gap-1`
            : fitMobile
              ? 'flex w-full items-center justify-between gap-0.5 sm:w-auto sm:justify-start sm:gap-1'
              : `flex w-full items-center gap-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [touch-action:pan-x_pan-y] ${
                  hasOverflow ? 'pr-7' : ''
                } ${
                  dragging
                    ? 'cursor-grabbing select-none'
                    : 'cursor-grab [scroll-snap-type:x_proximity]'
                }`
        } ${className}`}
        role="tablist"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const active = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={(e) => {
                onChange(option.id)
                if (scrollable) {
                  e.currentTarget.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'nearest',
                    block: 'nearest',
                  })
                }
              }}
              className={`inline-flex h-[var(--control-h-sm)] items-center justify-center gap-1 whitespace-nowrap rounded-[7px] px-2 text-[11.5px] font-bold leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:rounded-[8px] sm:px-2.5 sm:text-xs ${
                equalWidth
                  ? 'min-w-0 flex-1 px-1.5 text-center'
                  : fitMobile
                    ? 'flex-auto px-1.5 sm:flex-initial sm:px-2.5'
                    : 'shrink-0 snap-start'
              } ${
                active
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-brand-navy/75 hover:bg-page hover:text-brand-navy'
              }`}
            >
              {option.icon &&
                (fitMobile ? (
                  <span className="hidden shrink-0 sm:inline-flex">{option.icon}</span>
                ) : (
                  option.icon
                ))}
              <span className={equalWidth ? 'truncate' : ''}>{option.label}</span>
            </button>
          )
        })}
      </div>

      {scrollable && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollStrip(1)}
          aria-label="Scroll filter options right"
          className="absolute inset-y-0.5 right-0.5 z-10 inline-flex w-7 items-center justify-end rounded-r-[var(--radius-control)] bg-gradient-to-l from-white via-white/95 to-transparent pr-1 text-brand-navy/75 hover:text-brand-primary focus-visible:outline-none"
        >
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </button>
      )}
    </div>
  )
}
