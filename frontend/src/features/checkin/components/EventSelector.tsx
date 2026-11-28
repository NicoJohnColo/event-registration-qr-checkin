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
  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null
  const isToday =
    selectedEvent !== null && isTodayInManila(selectedEvent.startsAt, selectedEvent.endsAt)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="checkin-event-select" className="block text-[11px] font-bold text-brand-navy sm:text-xs">
          Active Event
        </label>
        {selectedEvent && (
          <span className="text-[10.5px] font-semibold text-brand-primary sm:text-[11px]">
            {isToday ? 'Check-in open today' : formatCebuDate(selectedEvent.startsAt)}
          </span>
        )}
      </div>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-primary sm:left-3" />
        <select
          id="checkin-event-select"
          value={selectedEventId ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled || events.length === 0}
          className="h-[var(--control-h)] w-full appearance-none overflow-hidden text-ellipsis whitespace-nowrap rounded-[var(--radius-control)] border border-transparent bg-[#F3F5F9] pl-8 pr-7 text-xs font-bold text-brand-navy transition-colors focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100 sm:pl-8.5 sm:text-sm"
        >
          {events.length === 0 && <option value="">No events available</option>}
          {events.map((event) => {
            const eventToday = isTodayInManila(event.startsAt, event.endsAt)
            const suffix = eventToday ? ' (Today)' : ` (${formatCebuDate(event.startsAt)})`
            return (
              <option key={event.id} value={event.id}>
                {event.title}
                {suffix}
              </option>
            )
          })}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-navy/65 sm:right-3.5 sm:text-xs">
          ▼
        </span>
      </div>
    </div>
  )
}
