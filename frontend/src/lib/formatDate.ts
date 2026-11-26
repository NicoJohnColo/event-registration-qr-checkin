import { APP_TIMEZONE } from './constants'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const monthShortFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  month: 'short',
})

const dayNumFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  day: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  weekday: 'short',
})

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatCebuDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatCebuTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function formatCebuTimeRange(startsAt: string, endsAt: string): string {
  return `${formatCebuTime(startsAt)} – ${formatCebuTime(endsAt)}`
}

export function formatCebuDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function getCebuDateParts(iso: string): { month: string; day: string; weekday: string } {
  const date = new Date(iso)
  return {
    month: monthShortFormatter.format(date).toUpperCase(),
    day: dayNumFormatter.format(date),
    weekday: weekdayFormatter.format(date),
  }
}

export function isTodayInManila(startsAt: string, endsAt: string): boolean {
  const today = isoDateFormatter.format(new Date())
  const start = isoDateFormatter.format(new Date(startsAt))
  const end = isoDateFormatter.format(new Date(endsAt))
  return today >= start && today <= end
}

const time24Formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function toManilaDateInput(iso: string): string {
  return isoDateFormatter.format(new Date(iso))
}

export function getTodayManilaDateInput(): string {
  return isoDateFormatter.format(new Date())
}

export function toManilaTimeInput(iso: string): string {
  const formatted = time24Formatter.format(new Date(iso))
  return formatted.startsWith('24:') ? `00:${formatted.slice(3)}` : formatted
}

export function fromManilaDateAndTime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00+08:00`).toISOString()
}
