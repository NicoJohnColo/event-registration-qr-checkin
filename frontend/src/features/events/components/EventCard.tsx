import { ArrowRight, CheckCircle2, Clock, MapPin } from 'lucide-react'
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
      ? 'bg-gradient-to-r from-status-amber via-amber-400 to-amber-300'
      : 'bg-gradient-to-r from-brand-primary via-brand-blue to-brand-cyan'

  const badge = event.ended ? (
    <StatusBadge tone="neutral" icon={<Clock className="h-3.5 w-3.5" />}>
      Ended
    </StatusBadge>
  ) : event.full ? (
    <StatusBadge tone="amber" icon={<Clock className="h-3.5 w-3.5" />}>
      Waitlist
    </StatusBadge>
  ) : happeningToday ? (
    <StatusBadge tone="blue" pulse>
      Happening Today
    </StatusBadge>
  ) : (
    <StatusBadge tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
      Open
    </StatusBadge>
  )

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border bg-surface shadow-card transition-all duration-200 ease-out animate-rise ${animationDelayClass} ${
        event.ended
          ? 'border-border/80 opacity-85'
          : 'border-border/90 hover:-translate-y-0.5 hover:border-brand-sky-end hover:shadow-card-hover'
      }`}
    >
      <div className={`h-1 w-full ${topAccentClass}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div className="min-w-0">
          {/* Clean aligned header row: slim date + prefix on left, crisp status badge on right */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`hidden h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[8px] border text-center sm:flex ${
                  event.ended
                    ? 'border-slate-200 bg-slate-50 text-slate-600'
                    : 'border-brand-sky bg-sky-50/80 text-brand-navy'
                }`}
              >
                <span className="text-[11px] font-bold uppercase leading-none text-brand-primary">
                  {dateParts.month}
                </span>
                <span className="font-heading mt-0.5 text-sm font-extrabold leading-none">
                  {dateParts.day}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-brand-primary sm:text-brand-navy/85">
                  {formatCebuDate(event.startsAt)}
                </p>
                <p className="font-code hidden text-[11px] font-semibold text-brand-navy/65 sm:mt-0.5 sm:block">
                  Prefix: {event.codePrefix}
                </p>
              </div>
            </div>
            <div className="shrink-0">{badge}</div>
          </div>

          <Link to={`/events/${event.id}`} className="mt-1.5 block sm:mt-2.5">
            <h3 className="heading-card font-heading line-clamp-2 font-extrabold text-brand-navy transition-colors group-hover:text-brand-primary">
              {event.title}
            </h3>
          </Link>

          <p className="mt-1 hidden text-xs leading-relaxed text-brand-navy/70 sm:line-clamp-2">
            {event.description}
          </p>

          <dl className="mt-2 space-y-1 text-xs leading-snug text-brand-navy/80 sm:mt-2.5 sm:rounded-[8px] sm:bg-page/85 sm:px-2.5 sm:py-1.5 sm:text-[11.5px]">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {formatCebuTimeRange(event.startsAt, event.endsAt)} · Cebu time
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span className="min-w-0 flex-1 truncate font-semibold">{event.venue}</span>
            </div>
          </dl>
        </div>

        <div className="mt-2.5 space-y-2 border-t border-border/70 pt-2.5 sm:mt-3 sm:space-y-2.5">
          <SpotsLeft event={event} compact />

          {event.ended ? (
            <div>
              <Link to={`/events/${event.id}`} className="block">
                <Button variant="outline" size="sm" fullWidth>
                  View Event Summary
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 min-[280px]:grid-cols-2">
              <Link to={`/events/${event.id}`} className="block">
                <Button variant="outline" size="sm" fullWidth>
                  Details
                </Button>
              </Link>

              {event.full ? (
                <Link to={`/events/${event.id}/register`} className="block">
                  <Button variant="secondary" size="sm" fullWidth className="group/btn">
                    <span>Join Waitlist</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                  </Button>
                </Link>
              ) : (
                <Link to={`/events/${event.id}/register`} className="block">
                  <Button variant="primary" size="sm" fullWidth className="group/btn">
                    <span>Register</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
