import type { EventItem } from '../types'

interface SpotsLeftProps {
  event: Pick<EventItem, 'capacity' | 'spotsLeft' | 'full' | 'ended'>
  compact?: boolean
}

export function SpotsLeft({ event, compact = false }: SpotsLeftProps) {
  const taken = Math.max(0, event.capacity - event.spotsLeft)
  const percentFilled =
    event.capacity > 0 ? Math.min(100, Math.round((taken / event.capacity) * 100)) : 100
  const lowSpots =
    !event.full && !event.ended && event.spotsLeft <= Math.max(3, Math.ceil(event.capacity * 0.2))

  const barClass = event.ended
    ? 'bg-slate-300'
    : event.full
      ? 'bg-status-red'
      : lowSpots
        ? 'bg-gradient-to-r from-status-amber to-amber-400'
        : 'bg-gradient-to-r from-brand-primary via-brand-blue to-brand-cyan'

  const labelClass = event.ended
    ? 'text-slate-500'
    : event.full
      ? 'text-status-red'
      : lowSpots
        ? 'text-status-amber'
        : 'text-brand-navy'

  const label = event.ended
    ? `Ended · ${taken} of ${event.capacity} attended`
    : event.full
      ? `Full · 0 of ${event.capacity} spots left`
      : `${event.spotsLeft} of ${event.capacity} spots left`

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-1.5 sm:space-y-2'}>
      <div className="flex items-center justify-between gap-2 text-xs font-bold">
        <span className={labelClass}>{label}</span>
        {!event.ended && (
          <span className="shrink-0 text-[11px] font-semibold text-brand-navy/65 sm:rounded-full sm:bg-page sm:px-2.5 sm:py-0.5 sm:text-xs sm:font-bold sm:text-brand-navy/75">
            {percentFilled}% filled
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 sm:h-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barClass}`}
          style={{ width: `${percentFilled}%` }}
        />
      </div>
    </div>
  )
}
