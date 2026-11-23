import { CheckCircle2, ScanLine, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../features/auth'

interface StaffPortalPlaceholderPageProps {
  section: 'check-in' | 'attendees'
}

export function StaffPortalPlaceholderPage({ section }: StaffPortalPlaceholderPageProps) {
  const { staff } = useAuth()
  const isCheckIn = section === 'check-in'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="rounded-[20px] border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
            Authenticated Staff Session
          </StatusBadge>
          {staff && (
            <span className="font-code text-xs font-semibold text-brand-navy/70">
              {staff.name} (@{staff.username}) · {staff.role}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-brand-primary ring-1 ring-brand-sky">
            {isCheckIn ? <ScanLine className="h-5 w-5" /> : <Users className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-black text-brand-navy">
              {isCheckIn ? 'Door Check-In Console' : 'Event Attendee Roster'}
            </h1>
            <p className="mt-1 text-sm text-brand-navy/75">
              {isCheckIn
                ? 'Protected staff check-in route is active and verified. Live ticket scanning & green/yellow/red check-in responses will be wired here in Phase 6.'
                : 'Protected staff attendee roster route is active and verified. Live attendee search and check-in totals will be wired here in Phase 7.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
          <Link to={isCheckIn ? '/staff/attendees' : '/staff/check-in'}>
            <Button variant="secondary" size="md">
              {isCheckIn ? 'Preview Attendees Route' : 'Go to Check-In Route'}
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="md">
              Open Public Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
