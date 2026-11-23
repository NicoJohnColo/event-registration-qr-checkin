import { CalendarDays } from 'lucide-react'
import type { EventItem } from '../../events'
import { formatCebuDate, isTodayInManila } from '../../../lib/formatDate'

interface EventSelectorProps {
  events: EventItem[]
  selectedEventId: number | null
  onChange: (eventId: number) => void
  disabled?: boolean
}

export function EventSelector({
  events,
  selectedEventId,
  onChange,
  disabled = false,
}: EventSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="checkin-event-select" className="block text-sm font-semibold text-brand-navy">
        Active Event
      </label>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary" />
        <select
          id="checkin-event-select"
          value={selectedEventId ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled || events.length === 0}
          className="h-12 w-full appearance-none rounded-[12px] border border-border bg-surface pl-10 pr-9 text-sm font-semibold text-brand-navy transition-colors focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {events.length === 0 && <option value="">No events available</option>}
          {events.map((event) => {
            const isToday = isTodayInManila(event.startsAt, event.endsAt)
            const suffix = isToday ? ' · Today (Open)' : ` · ${formatCebuDate(event.startsAt)}`
            return (
              <option key={event.id} value={event.id}>
                {event.title}
                {suffix}
              </option>
            )
          })}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-brand-navy/50">
          ▼
        </span>
      </div>
    </div>
  )
}
