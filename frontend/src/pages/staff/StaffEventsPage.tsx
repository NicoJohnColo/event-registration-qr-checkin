import { ArrowLeft, Calendar, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'

export function StaffEventsPage() {
  return (
    <div className="page-container animate-rise space-y-3.5 py-4 sm:space-y-4 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/staff/dashboard"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-brand-navy/75 hover:text-brand-primary md:hidden"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <StatusBadge tone="blue" icon={<Calendar className="h-3.5 w-3.5" />}>
              Organizer Tools · Asia/Manila
            </StatusBadge>
          </div>
          <h1 className="heading-hero font-heading mt-2 font-extrabold text-brand-navy">
            Manage Events
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/75 sm:text-sm">
            Create new events, publish drafts, edit schedules, and close registrations.
          </p>
        </div>

        <Button variant="primary" size="md" className="min-h-[40px] self-start sm:self-auto">
          <Plus className="h-4 w-4 shrink-0" />
          <span>New Event</span>
        </Button>
      </div>

      <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-8 text-center shadow-card">
        <Calendar className="mx-auto mb-2 h-8 w-8 text-brand-primary/45" />
        <p className="text-sm font-bold text-brand-navy">Event Management view coming up next</p>
        <p className="mt-1 text-xs text-brand-navy/65">
          Connects to backend CRUD endpoints (Create, Edit, Publish/Draft, and Close).
        </p>
      </div>
    </div>
  )
}
