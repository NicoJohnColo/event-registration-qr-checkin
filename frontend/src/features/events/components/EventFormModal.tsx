import { Hash, Loader2, MapPin, Users, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { ApiClientError } from '../../../lib/apiClient'
import {
  fromManilaDateAndTime,
  getTodayManilaDateInput,
  toManilaDateInput,
  toManilaTimeInput,
} from '../../../lib/formatDate'
import { useCreateEvent, useUpdateEvent } from '../hooks'
import type { EventStatus, EventUpsertPayload, StaffEventItem } from '../types'

interface EventFormModalProps {
  open: boolean
  event: StaffEventItem | null
  onClose: () => void
  onSaved: (saved: StaffEventItem, mode: 'create' | 'edit') => void
}

interface FormErrors {
  title?: string
  venue?: string
  date?: string
  startTime?: string
  endTime?: string
  capacity?: string
  codePrefix?: string
  description?: string
}

const STATUS_OPTIONS: Array<{ value: EventStatus; label: string; hint: string }> = [
  { value: 'DRAFT', label: 'Draft', hint: 'Hidden from public' },
  { value: 'PUBLISHED', label: 'Published', hint: 'Visible & open' },
  { value: 'CLOSED', label: 'Closed', hint: 'Registration stopped' },
]

export function EventFormModal({ open, event, onClose, onSaved }: EventFormModalProps) {
  const isEdit = Boolean(event)
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()

  const activeRegistered = event ? event.confirmedCount + event.checkedInCount : 0

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [capacity, setCapacity] = useState('30')
  const [status, setStatus] = useState<EventStatus>('DRAFT')
  const [codePrefix, setCodePrefix] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setServerError(null)
    if (event) {
      setTitle(event.title)
      setDescription(event.description ?? '')
      setVenue(event.venue)
      setDate(toManilaDateInput(event.startsAt))
      setStartTime(toManilaTimeInput(event.startsAt))
      setEndTime(toManilaTimeInput(event.endsAt))
      setCapacity(String(event.capacity))
      setStatus(event.status)
      setCodePrefix(event.codePrefix)
    } else {
      setTitle('')
      setDescription('')
      setVenue('')
      setDate(getTodayManilaDateInput())
      setStartTime('09:00')
      setEndTime('17:00')
      setCapacity('30')
      setStatus('DRAFT')
      setCodePrefix('')
    }
  }, [open, event])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const isPending = createMutation.isPending || updateMutation.isPending
  const activeStatusHint = STATUS_OPTIONS.find((s) => s.value === status)?.hint

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    const cleanTitle = title.trim()
    const cleanVenue = venue.trim()
    const cleanPrefix = codePrefix.trim().toUpperCase()
    const capNum = Number(capacity)

    if (!cleanTitle) {
      next.title = 'Event title is required.'
    } else if (cleanTitle.length > 150) {
      next.title = 'Title must be 150 characters or fewer.'
    }

    if (!cleanVenue) {
      next.venue = 'Venue is required.'
    } else if (cleanVenue.length > 200) {
      next.venue = 'Venue must be 200 characters or fewer.'
    }

    if (!date) next.date = 'Date is required.'
    if (!startTime) next.startTime = 'Start time is required.'
    if (!endTime) next.endTime = 'End time is required.'

    if (date && startTime && endTime) {
      const startIso = fromManilaDateAndTime(date, startTime)
      const endIso = fromManilaDateAndTime(date, endTime)
      if (new Date(endIso) <= new Date(startIso)) {
        next.endTime = 'End time must be after start time.'
      }
    }

    if (!Number.isInteger(capNum) || capNum < 1) {
      next.capacity = 'Capacity must be at least 1.'
    } else if (isEdit && capNum < activeRegistered) {
      next.capacity = `Cannot be lower than ${activeRegistered} registered.`
    }

    if (!isEdit && cleanPrefix.length > 0 && !/^[A-Z]{3,5}$/.test(cleanPrefix)) {
      next.codePrefix = 'Use 3–5 uppercase letters.'
    }

    if (description.trim().length > 2000) {
      next.description = 'Description must be 2000 characters or fewer.'
    }

    return next
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    const cleanPrefix = codePrefix.trim().toUpperCase()
    const payload: EventUpsertPayload = {
      title: title.trim(),
      description: description.trim(),
      venue: venue.trim(),
      startsAt: fromManilaDateAndTime(date, startTime),
      endsAt: fromManilaDateAndTime(date, endTime),
      capacity: Number(capacity),
      status,
      codePrefix: isEdit ? event?.codePrefix : cleanPrefix ? cleanPrefix : null,
    }

    try {
      if (isEdit && event) {
        const updated = await updateMutation.mutateAsync({ id: event.id, payload })
        onSaved(updated, 'edit')
      } else {
        const created = await createMutation.mutateAsync(payload)
        onSaved(created, 'create')
      }
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (Object.keys(err.fieldErrors).length > 0) {
          setErrors((prev) => ({
            ...prev,
            title: err.fieldErrors.title,
            venue: err.fieldErrors.venue,
            capacity: err.fieldErrors.capacity,
            codePrefix: err.fieldErrors.codePrefix,
            description: err.fieldErrors.description,
            endTime: err.fieldErrors.endsAt,
          }))
        }
        setServerError(err.message)
      } else {
        setServerError('Unable to save event right now. Please try again.')
      }
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/45 p-3 backdrop-blur-[3px] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="animate-modal-in flex max-h-[82dvh] w-full max-w-[360px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-brand-sky/75 bg-white shadow-2xl sm:max-h-[88dvh] sm:max-w-[520px]">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between gap-2.5 border-b border-border/80 bg-page/75 px-3.5 py-2 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-primary sm:text-[11px]">
              {isEdit ? 'Edit Event Details' : 'Create New Event'}
            </p>
            <h2
              id="event-form-modal-title"
              className="font-heading truncate text-sm font-extrabold text-brand-navy sm:text-base"
            >
              {isEdit ? event?.title : 'New Cebu Event'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border bg-white text-brand-navy/70 transition-colors hover:bg-page hover:text-brand-navy focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 sm:h-9 sm:w-9"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="staff-event-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3.5 py-2.5 [-webkit-overflow-scrolling:touch] sm:space-y-3 sm:p-5"
          noValidate
        >
          {serverError && (
            <Alert tone="error" title="Could not save event">
              {serverError}
            </Alert>
          )}

          {/* Status Segmented Selector */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-brand-navy">
                Event Status <span className="text-status-red">*</span>
              </span>
              <span className="text-[11px] font-semibold text-brand-navy/65">
                {activeStatusHint}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-[var(--radius-control)] border border-border bg-page p-1">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex h-[var(--control-h-sm)] items-center justify-center rounded-[6px] px-2 text-[11px] font-extrabold transition-all sm:h-9 sm:rounded-[8px] sm:text-xs ${
                      active
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-brand-navy/75 hover:bg-white/80 hover:text-brand-navy'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Event Title */}
          <FormField label="Event Title" htmlFor="ev-title" required error={errors.title}>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }))
              }}
              placeholder="e.g. Cebu Tech Summit 2026"
              hasError={Boolean(errors.title)}
              maxLength={150}
            />
          </FormField>

          {/* Row: Code Prefix + Capacity (side-by-side compact pair on all viewports) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <FormField
              label="Code Prefix"
              htmlFor="ev-prefix"
              error={errors.codePrefix}
              hint={isEdit ? 'Locked' : 'e.g. CTS'}
            >
              <Input
                id="ev-prefix"
                type="text"
                value={codePrefix}
                disabled={isEdit}
                onChange={(e) => {
                  setCodePrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5))
                  if (errors.codePrefix) setErrors((p) => ({ ...p, codePrefix: undefined }))
                }}
                placeholder="Auto"
                leftIcon={<Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                className="font-code uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal disabled:opacity-65"
                hasError={Boolean(errors.codePrefix)}
                maxLength={5}
              />
            </FormField>

            <FormField
              label="Capacity"
              htmlFor="ev-capacity"
              required
              error={errors.capacity}
              hint={isEdit && activeRegistered > 0 ? `Min ${activeRegistered}` : undefined}
            >
              <Input
                id="ev-capacity"
                type="number"
                min={1}
                inputMode="numeric"
                value={capacity}
                onChange={(e) => {
                  setCapacity(e.target.value)
                  if (errors.capacity) setErrors((p) => ({ ...p, capacity: undefined }))
                }}
                leftIcon={<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                hasError={Boolean(errors.capacity)}
              />
            </FormField>
          </div>

          {/* Venue */}
          <FormField label="Venue" htmlFor="ev-venue" required error={errors.venue}>
            <Input
              id="ev-venue"
              value={venue}
              onChange={(e) => {
                setVenue(e.target.value)
                if (errors.venue) setErrors((p) => ({ ...p, venue: undefined }))
              }}
              placeholder="e.g. Ayala Center Cebu, Function Room 2"
              leftIcon={<MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              hasError={Boolean(errors.venue)}
              maxLength={200}
            />
          </FormField>

          {/* Row: Date + Start Time + End Time (no duplicate left icons on native date/time pickers) */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-2.5">
            <div className="col-span-2 sm:col-span-4">
              <FormField label="Date (Cebu)" htmlFor="ev-date" required error={errors.date}>
                <Input
                  id="ev-date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    if (errors.date) setErrors((p) => ({ ...p, date: undefined }))
                  }}
                  hasError={Boolean(errors.date)}
                />
              </FormField>
            </div>

            <div className="col-span-1 sm:col-span-4">
              <FormField label="Start Time" htmlFor="ev-start" required error={errors.startTime}>
                <Input
                  id="ev-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value)
                    if (errors.startTime || errors.endTime) {
                      setErrors((p) => ({ ...p, startTime: undefined, endTime: undefined }))
                    }
                  }}
                  hasError={Boolean(errors.startTime)}
                />
              </FormField>
            </div>

            <div className="col-span-1 sm:col-span-4">
              <FormField label="End Time" htmlFor="ev-end" required error={errors.endTime}>
                <Input
                  id="ev-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value)
                    if (errors.endTime) setErrors((p) => ({ ...p, endTime: undefined }))
                  }}
                  hasError={Boolean(errors.endTime)}
                />
              </FormField>
            </div>
          </div>

          {/* Description */}
          <FormField label="Description" htmlFor="ev-desc" error={errors.description}>
            <textarea
              id="ev-desc"
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((p) => ({ ...p, description: undefined }))
              }}
              placeholder="Brief agenda, speaker highlights, or check-in notes…"
              maxLength={2000}
              className="w-full rounded-[var(--radius-control)] border border-transparent bg-[#F3F5F9] p-2 text-[13px] text-brand-navy placeholder:text-slate-500 transition-colors focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand-primary/15 sm:p-2.5 sm:text-sm"
            />
          </FormField>
        </form>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/80 bg-page/75 px-3.5 py-2 sm:px-5 sm:py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="sm:h-9 sm:px-3.5 sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="staff-event-form"
            variant="primary"
            size="sm"
            disabled={isPending}
            className="sm:h-9 sm:px-3.5 sm:text-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                <span>Saving…</span>
              </>
            ) : (
              <span>{isEdit ? 'Save Changes' : 'Create Event'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
