import { ArrowRight, Ban, CalendarCheck2, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import {
  formatCebuDate,
  formatCebuTimeRange,
  getCebuDateParts,
  isTodayInManila,
} from '../../../lib/formatDate'
import type { EventItem } from '../types'
import { SpotsLeft } from './SpotsLeft'

interface EventCardProps {
  event: EventItem
  animationDelayClass?: string
}

export function EventCard({ event, animationDelayClass = '' }: EventCardProps) {
  const dateParts = getCebuDateParts(event.startsAt)
  const happeningToday = !event.ended && isTodayInManila(event.startsAt, event.endsAt)

  const topAccentClass = event.ended
    ? 'bg-slate-300'
    : event.full
      ? 'bg-status-red'
      : 'bg-gradient-to-r from-brand-primary via-brand-blue to-brand-cyan'

  const badge = event.ended ? (
    <StatusBadge tone="neutral" icon={<Clock className="h-3.5 w-3.5" />}>
      Ended
    </StatusBadge>
  ) : event.full ? (
    <StatusBadge tone="red" icon={<Ban className="h-3.5 w-3.5" />}>
      Full
    </StatusBadge>
  ) : happeningToday ? (
    <StatusBadge tone="blue" pulse icon={<CalendarCheck2 className="h-3.5 w-3.5" />}>
      Happening Today
    </StatusBadge>
  ) : (
    <StatusBadge tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
      Open
    </StatusBadge>
  )

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[20px] border bg-surface shadow-card transition-all duration-200 ease-out animate-rise ${animationDelayClass} ${
        event.ended
          ? 'border-border/80 opacity-85'
          : 'border-border/90 hover:-translate-y-1 hover:border-brand-sky-end hover:shadow-card-hover'
      }`}
    >
      <div className={`h-1 w-full ${topAccentClass}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-2xl border text-center ${
                  event.ended
                    ? 'border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-brand-sky bg-sky-50/80 text-brand-navy'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                  {dateParts.month}
                </span>
                <span className="font-heading text-lg font-bold leading-none">
                  {dateParts.day}
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase text-brand-navy/50">
                  {dateParts.weekday}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-navy/70">
                  {formatCebuDate(event.startsAt)}
                </p>
                <p className="font-code mt-0.5 text-[11px] font-semibold text-brand-navy/45">
                  Prefix: {event.codePrefix}
                </p>
              </div>
            </div>
            {badge}
          </div>

          <Link to={`/events/${event.id}`} className="mt-4 block">
            <h3 className="font-heading text-lg font-extrabold leading-snug text-brand-navy transition-colors group-hover:text-brand-primary">
              {event.title}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-navy/70">
            {event.description}
          </p>

          <dl className="mt-4 space-y-2 text-xs text-brand-navy/80">
            <div className="flex items-center gap-2 rounded-xl bg-page px-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="font-medium">
                {formatCebuTimeRange(event.startsAt, event.endsAt)} · Cebu time
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-page px-3 py-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="line-clamp-1 font-medium">{event.venue}</span>
            </div>
          </dl>
        </div>

        <div className="mt-5 space-y-4 border-t border-border/70 pt-4">
          <SpotsLeft event={event} compact />

          <div className="flex items-center gap-2.5">
            {event.ended ? (
              <Link to={`/events/${event.id}`} className="flex-1">
                <Button variant="outline" size="sm" fullWidth>
                  View Event Summary
                </Button>
              </Link>
            ) : (
              <>
                <Link to={`/events/${event.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    Details
                  </Button>
                </Link>

                {event.full ? (
                  <Button variant="primary" size="sm" fullWidth disabled className="flex-1">
                    Full
                  </Button>
                ) : (
                  <Link to={`/events/${event.id}/register`} className="flex-1">
                    <Button variant="primary" size="sm" fullWidth className="group/btn">
                      <span>Register</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
