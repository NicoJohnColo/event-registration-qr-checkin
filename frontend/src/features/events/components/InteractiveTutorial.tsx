import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Pause,
  Play,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  TicketCheck,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'

type TutorialRole = 'attendee' | 'staff'

interface StepInfo {
  title: string
  description: string
}

const ATTENDEE_STEPS: StepInfo[] = [
  {
    title: 'Pick a Cebu Event',
    description:
      'Browse published Cebu events with live remaining spots and 12-hour Asia/Manila schedules before claiming a seat.',
  },
  {
    title: '30-Second PH Registration',
    description:
      'Submit your name, unique email, and 11-digit Philippine mobile number. Server validation locks capacity immediately.',
  },
  {
    title: 'Instant QR Boarding Pass',
    description:
      'Receive your digital ticket with a unique pass code and signed QR image ready to scan at the venue entrance.',
  },
  {
    title: 'Anytime Ticket Lookup',
    description:
      'Retrieve your QR pass or cancel anytime using your ticket code and email — wrong pairs reveal zero attendee details.',
  },
]

const STAFF_STEPS: StepInfo[] = [
  {
    title: 'Protected Staff Sign-In',
    description:
      'Organizers and door staff sign in with BCrypt-hashed credentials and role-guarded JWT sessions on routes and API.',
  },
  {
    title: 'Camera & Manual QR Check-In',
    description:
      'Scan the attendee QR pass with your camera or enter the code manually to mark attendance with exact Cebu check-in time.',
  },
  {
    title: 'Duplicate Scan Guard',
    description:
      'Rescanning an already checked-in ticket triggers a yellow warning showing the exact first check-in timestamp.',
  },
  {
    title: 'Invalid Pass & Live Roster',
    description:
      'Unknown or wrong-event codes are blocked in red while organizers manage rosters, waitlists, and audit logs live.',
  },
]

export function InteractiveTutorial() {
  const [role, setRole] = useState<TutorialRole>('attendee')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  const steps = role === 'attendee' ? ATTENDEE_STEPS : STAFF_STEPS
  const current = steps[step]

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [playing, role, step, steps.length])

  const handleRoleChange = (nextRole: TutorialRole) => {
    setRole(nextRole)
    setStep(0)
  }

  return (
    <section id="tutorial" className="scroll-mt-16 border-y border-border bg-white py-7 sm:py-11">
      <div className="page-container">
        {/* Centered Header matching reference walkthrough style */}
        <div className="mx-auto max-w-lg text-center">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="heading-section mt-1 font-heading font-extrabold text-brand-navy">
            See EventRegister in action
          </h2>
          <p className="section-subtitle mt-1">
            Interactive walkthrough of the {steps.length} core stages.
          </p>

          <div
            className="mt-3.5 inline-grid grid-cols-2 gap-1 rounded-full border border-border/90 bg-page p-0.5"
            role="tablist"
            aria-label="Tutorial role switcher"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === 'attendee'}
              onClick={() => handleRoleChange('attendee')}
              className={`inline-flex h-7 items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-colors sm:h-7.5 sm:px-3.5 sm:text-xs ${
                role === 'attendee'
                  ? 'bg-white text-brand-primary shadow-2xs ring-1 ring-brand-sky'
                  : 'text-brand-navy/70 hover:text-brand-navy'
              }`}
            >
              <TicketCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Attendee</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === 'staff'}
              onClick={() => handleRoleChange('staff')}
              className={`inline-flex h-7 items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-colors sm:h-7.5 sm:px-3.5 sm:text-xs ${
                role === 'staff'
                  ? 'bg-white text-brand-primary shadow-2xs ring-1 ring-brand-sky'
                  : 'text-brand-navy/70 hover:text-brand-navy'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Door Staff</span>
            </button>
          </div>
        </div>

        {/* Single Centered Clean Walkthrough Card */}
        <article className="mx-auto mt-5 max-w-[540px] overflow-hidden rounded-[16px] border border-border/90 bg-white shadow-card sm:mt-6">
          {/* Top Tinted Preview Canvas (uniform fixed height across all steps so nothing shifts) */}
          <div className="flex h-[176px] items-center justify-center border-b border-border/75 bg-gradient-to-br from-[#F6F9FF] via-[#EEF4FF] to-[#E6F0FF] p-3.5 sm:h-[208px] sm:p-5">
            <div key={`${role}-${step}`} className="animate-soft-fade w-full">
              {role === 'attendee' ? <AttendeeScene step={step} /> : <StaffScene step={step} />}
            </div>
          </div>

          {/* Bottom Editorial Content + Stepper Controls */}
          <div className="p-4 sm:p-6">
            <p className="section-eyebrow">
              Step {step + 1} of {steps.length}
            </p>
            <h3 className="font-heading mt-1 text-base font-extrabold text-brand-navy sm:text-lg">
              {current.title}
            </h3>
            <p className="mt-1 min-h-[54px] text-xs leading-relaxed text-brand-navy/75 sm:min-h-[42px] sm:text-[13px]">
              {current.description}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1" role="tablist" aria-label="Walkthrough steps">
                  {steps.map((item, idx) => {
                    const active = idx === step
                    return (
                      <button
                        key={`${role}-dot-${item.title}`}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={`Step ${idx + 1}: ${item.title}`}
                        onClick={() => setStep(idx)}
                        className="inline-flex h-6 items-center px-0.5"
                      >
                        <span
                          className={`relative block h-1.5 overflow-hidden rounded-full transition-colors ${
                            active
                              ? 'w-6 bg-brand-sky'
                              : 'w-1.5 bg-brand-navy/20 hover:bg-brand-navy/40'
                          }`}
                        >
                          {active && playing && (
                            <span
                              key={`dot-${role}-${step}`}
                              className="animate-dot-timer-fill absolute inset-y-0 left-0 rounded-full bg-brand-primary"
                            />
                          )}
                          {active && !playing && (
                            <span className="absolute inset-0 rounded-full bg-brand-primary" />
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPlaying((prev) => !prev)}
                  aria-label={playing ? 'Pause walkthrough animation' : 'Play walkthrough animation'}
                  className="inline-flex h-6 items-center gap-1 rounded-full border border-border/80 bg-page px-2 text-[10px] font-bold text-brand-navy/75 transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
                >
                  {playing ? (
                    <>
                      <Pause className="h-2.5 w-2.5 text-brand-primary" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-2.5 w-2.5 text-brand-primary" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setStep((prev) => (prev + 1) % steps.length)}
                >
                  <span>{step === steps.length - 1 ? 'Restart' : 'Next'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function AttendeeScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="grid grid-cols-12 items-center gap-2 sm:gap-3">
        <div className="animate-chip-in col-span-6 rounded-xl border border-border/80 bg-white p-2.5 shadow-2xs sm:p-3">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-navy/50 sm:text-[10px]">
            Published Event
          </p>
          <p className="mt-1 truncate text-xs font-extrabold text-brand-navy sm:text-[13px]">
            Cebu Dev Meetup
          </p>
          <p className="mt-1 text-[10.5px] text-brand-navy/70 sm:text-xs">8:00 AM · Ayala Cebu</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan transition-all duration-500" />
          </div>
        </div>

        <div className="col-span-1 flex justify-center text-brand-primary">
          <ArrowRight className="animate-nudge h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div className="col-span-5 space-y-1.5">
          <div className="animate-chip-in delay-75 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
            <span className="truncate">27 spots left</span>
          </div>
          <div className="animate-chip-in delay-150 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-status-green" />
            <span className="truncate">Free · Instant</span>
          </div>
          <div className="animate-chip-in delay-225 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-navy" />
            <span className="font-code truncate">Prefix: CDM</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="grid grid-cols-12 items-center gap-2 sm:gap-3">
        <div className="animate-chip-in col-span-6 space-y-1.5 rounded-xl border border-border/80 bg-white p-2.5 shadow-2xs sm:p-3">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-navy/50 sm:text-[10px]">
            Attendee Form
          </p>
          <p className="truncate text-[11px] font-bold text-brand-navy sm:text-xs">Juan Dela Cruz</p>
          <span className="animate-highlight inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary sm:text-[11px]">
            juan@example.com
          </span>
          <p className="font-code text-[10.5px] font-bold text-brand-navy/80 sm:text-xs">
            09171234567
          </p>
        </div>

        <div className="col-span-1 flex justify-center text-brand-primary">
          <ArrowRight className="animate-nudge h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div className="col-span-5 space-y-1.5">
          <div className="animate-chip-in delay-75 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-status-green" />
            <span className="truncate">Unique Email</span>
          </div>
          <div className="animate-chip-in delay-150 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
            <span className="truncate">09XX Validated</span>
          </div>
          <div className="animate-chip-in delay-225 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-navy" />
            <span className="truncate">Seat Reserved</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="mx-auto flex max-w-[380px] items-center justify-between gap-3 rounded-xl border border-border/80 bg-white p-3 shadow-2xs sm:p-3.5">
        <div className="min-w-0 space-y-1">
          <span className="animate-chip-in inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-status-green">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed Pass
          </span>
          <p className="font-heading truncate text-xs font-extrabold text-brand-navy sm:text-sm">
            Juan Dela Cruz
          </p>
          <p className="text-[10.5px] text-brand-navy/65 sm:text-xs">Cebu Dev Meetup 2026</p>
          <p className="font-code animate-highlight inline-block rounded px-2 py-0.5 text-xs font-bold tracking-wider text-brand-primary">
            CDM-7K3P9Q
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center rounded-lg border border-border/80 bg-page/75 p-2">
          <div className="relative overflow-hidden rounded bg-white p-0.5">
            <QrCode className="h-12 w-12 text-brand-navy sm:h-14 sm:w-14" strokeWidth={1.6} />
            <div className="animate-qr-beam pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_8px_#1951FC]" />
          </div>
          <span className="mt-1 text-[9.5px] font-bold text-brand-primary">Ready at door</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 items-center gap-2 sm:gap-3">
      <div className="animate-chip-in col-span-6 space-y-1.5 rounded-xl border border-border/80 bg-white p-2.5 shadow-2xs sm:p-3">
        <div className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-brand-navy/50 sm:text-[10px]">
          <Search className="h-3 w-3 text-brand-primary" />
          <span>Ticket Lookup</span>
        </div>
        <p className="font-code animate-highlight inline-block rounded px-1 text-xs font-bold text-brand-navy">
          CDM-7K3P9Q
        </p>
        <p className="truncate text-[10.5px] text-brand-navy/70 sm:text-xs">juan@example.com</p>
      </div>

      <div className="col-span-1 flex justify-center text-brand-primary">
        <ArrowRight className="animate-nudge h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      <div className="col-span-5 space-y-1.5">
        <div className="animate-chip-in delay-75 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-status-green shadow-2xs sm:text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Pass Restored</span>
        </div>
        <div className="animate-chip-in delay-150 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy/75 shadow-2xs sm:text-xs">
          <Lock className="h-3 w-3 shrink-0 text-brand-primary" />
          <span className="truncate">Zero Leaks</span>
        </div>
      </div>
    </div>
  )
}

function StaffScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="grid grid-cols-12 items-center gap-2 sm:gap-3">
        <div className="animate-chip-in col-span-6 space-y-1.5 rounded-xl border border-border/80 bg-white p-2.5 shadow-2xs sm:p-3">
          <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-brand-navy/50 sm:text-[10px]">
            <Lock className="h-3 w-3 text-brand-primary" />
            <span>Staff Sign-In</span>
          </div>
          <p className="font-code text-xs font-bold text-brand-navy">organizer</p>
          <p className="font-code text-[10.5px] tracking-widest text-brand-navy/60">••••••••••</p>
        </div>

        <div className="col-span-1 flex justify-center text-brand-primary">
          <ArrowRight className="animate-nudge h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div className="col-span-5 space-y-1.5">
          <div className="animate-chip-in delay-75 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-status-green" />
            <span className="truncate">BCrypt Checked</span>
          </div>
          <div className="animate-chip-in delay-150 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
            <span className="truncate">JWT Session</span>
          </div>
          <div className="animate-chip-in delay-225 flex items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-brand-navy shadow-2xs sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-navy" />
            <span className="truncate">Role Guarded</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-[380px] space-y-2 rounded-xl border border-border/80 bg-white p-3 shadow-2xs sm:p-3.5">
        <div className="flex items-center justify-between gap-2 rounded-lg bg-page px-2.5 py-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-code font-bold text-brand-navy">
            <ScanLine className="h-3.5 w-3.5 text-brand-primary" />
            <span className="animate-highlight rounded px-1">CDM-7K3P9Q</span>
          </span>
          <span className="text-[10.5px] font-bold text-brand-primary">4 / 30 Checked In</span>
        </div>
        <div className="animate-chip-in delay-150 flex items-center gap-2 rounded-lg border border-status-green/35 bg-emerald-50 px-2.5 py-2 text-status-green">
          <UserCheck className="h-4.5 w-4.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10.5px] font-extrabold uppercase tracking-wider">Checked In</p>
            <p className="truncate text-xs font-bold text-brand-navy">
              Juan Dela Cruz · 8:14 AM PHT
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-[380px] space-y-2 rounded-xl border border-border/80 bg-white p-3 shadow-2xs sm:p-3.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-brand-navy/70">
          <span>Second Scan Attempt</span>
          <span className="font-code text-brand-navy">CDM-7K3P9Q</span>
        </div>
        <div className="animate-chip-in delay-150 flex items-center gap-2 rounded-lg border border-status-amber/35 bg-amber-50 px-2.5 py-2 text-status-amber">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10.5px] font-extrabold uppercase tracking-wider">
              Already Checked In
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-amber-900">
              <Clock className="h-3 w-3 shrink-0" />
              <span>First scanned at 8:14 AM (Asia/Manila)</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[380px] space-y-2 rounded-xl border border-border/80 bg-white p-3 shadow-2xs sm:p-3.5">
      <div className="animate-chip-in flex items-center gap-2 rounded-lg border border-status-red/35 bg-red-50 px-2.5 py-2 text-status-red">
        <XCircle className="h-4.5 w-4.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10.5px] font-extrabold uppercase tracking-wider">Invalid Ticket</p>
          <p className="truncate text-xs font-semibold text-red-900">
            Unknown code <span className="font-code">CDM-ZZZZZZ</span> or wrong event
          </p>
        </div>
      </div>
      <div className="animate-chip-in delay-150 flex items-center justify-between rounded-lg bg-page px-2.5 py-1.5 text-[11px] font-bold text-brand-navy">
        <span>Attendee Roster Live Totals</span>
        <span className="text-brand-primary">4 / 30 · 4 Checked In</span>
      </div>
    </div>
  )
}
