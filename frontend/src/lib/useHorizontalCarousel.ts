import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'

interface UseHorizontalCarouselOptions {
  itemCount: number
  isActive: boolean
  desktopBreakpoint?: number
  mobileGap?: number
  desktopGap?: number
}

/**
 * Coordinates horizontal carousel state, button/dot scrolling, and mouse/pen
 * pointer drag-to-swipe alongside native touch inertial scrolling.
 */
export function useHorizontalCarousel({
  itemCount,
  isActive,
  desktopBreakpoint = 768,
  mobileGap = 12,
  desktopGap = 16,
}: UseHorizontalCarouselOptions) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false })

  const [dragging, setDragging] = useState(false)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const getGap = useCallback(
    () => (typeof window !== 'undefined' && window.innerWidth >= desktopBreakpoint ? desktopGap : mobileGap),
    [desktopBreakpoint, desktopGap, mobileGap],
  )

  const syncCarouselState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4)

    const firstCard = el.firstElementChild as HTMLElement | null
    if (firstCard) {
      const step = firstCard.getBoundingClientRect().width + getGap()
      if (step > 0) {
        setActiveIndex(
          Math.min(Math.max(itemCount - 1, 0), Math.max(0, Math.round(scrollLeft / step))),
        )
      }
    }
  }, [getGap, itemCount])

  useEffect(() => {
    if (!isActive) return
    syncCarouselState()
    window.addEventListener('resize', syncCarouselState)
    return () => window.removeEventListener('resize', syncCarouselState)
  }, [isActive, syncCarouselState, itemCount])

  useEffect(() => {
    if (isActive && trackRef.current) {
      trackRef.current.scrollTo({ left: 0 })
      setActiveIndex(0)
      syncCarouselState()
    }
  }, [itemCount, isActive, syncCarouselState])

  const scrollByCard = useCallback(
    (direction: -1 | 1) => {
      const el = trackRef.current
      if (!el) return
      const firstCard = el.firstElementChild as HTMLElement | null
      const step = firstCard ? firstCard.getBoundingClientRect().width + getGap() : 280
      el.scrollBy({ left: direction * step, behavior: 'smooth' })
    },
    [getGap],
  )

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = trackRef.current
      if (!el) return
      const firstCard = el.firstElementChild as HTMLElement | null
      const step = firstCard ? firstCard.getBoundingClientRect().width + getGap() : 280
      el.scrollTo({ left: index * step, behavior: 'smooth' })
    },
    [getGap],
  )

  const endPointerDrag = useCallback(() => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setDragging(false)
    window.setTimeout(() => {
      dragRef.current.moved = false
    }, 0)
  }, [])

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || e.button !== 0 || !trackRef.current) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: trackRef.current.scrollLeft,
      moved: false,
    }
    setDragging(true)
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !trackRef.current) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 6) {
      dragRef.current.moved = true
    }
    if (dragRef.current.moved) {
      trackRef.current.scrollLeft = dragRef.current.startScrollLeft - dx
    }
  }, [])

  const handleClickCapture = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  return {
    trackRef,
    dragging,
    canPrev,
    canNext,
    activeIndex,
    scrollByCard,
    scrollToIndex,
    trackProps: {
      onScroll: syncCarouselState,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endPointerDrag,
      onPointerCancel: endPointerDrag,
      onPointerLeave: endPointerDrag,
      onDragStart: handleDragStart,
      onClickCapture: handleClickCapture,
    },
  }
}
