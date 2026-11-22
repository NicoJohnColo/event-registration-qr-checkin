import {
  AlertTriangle,
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
  Users,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type TutorialRole = 'attendee' | 'staff'

interface StepInfo {
  num: string
  title: string
  subtitle: string
}

const ATTENDEE_STEPS: StepInfo[] = [
  {
    num: '01',
    title: 'Pick a Cebu Event',
    subtitle: 'Check real-time spots left & 12-hour Cebu schedule',
  },
  {
    num: '02',
    title: '30-Second PH Registration',
    subtitle: 'Validated email + 11-digit PH mobile (09XXXXXXXXX)',
  },
  {
    num: '03',
    title: 'Instant QR Boarding Pass',
    subtitle: 'Unique ticket code + mobile QR ready for the entrance',
  },
  {
    num: '04',
    title: 'Anytime Ticket Lookup',
    subtitle: 'Retrieve your pass with ticket code + email without leaks',
  },
]

const STAFF_STEPS: StepInfo[] = [
  {
    num: '01',
    title: 'Protected Staff Sign-In',
    subtitle: 'BCrypt + JWT auth enforced on both routes and API',
  },
  {
    num: '02',
    title: 'Valid Scan → Green Checked In',
    subtitle: 'Select event, scan/enter code — attendee checked in',
  },
  {
    num: '03',
    title: 'Duplicate Scan → Yellow Warning',
    subtitle: 'Shows "Already checked in" with the first check-in time',
  },
  {
    num: '04',
    title: 'Invalid Guard & Attendee List',
    subtitle: 'Unknown or wrong-event codes show Red + live totals table',
  },
]

export function InteractiveTutorial() {
  const [role, setRole] = useState<TutorialRole>('attendee')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  const steps = role === 'attendee' ? ATTENDEE_STEPS : STAFF_STEPS

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStep((prev) => (prev + 1) % 4)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [playing, role, step])

  const handleRoleChange = (nextRole: TutorialRole) => {
    setRole(nextRole)
    setStep(0)
  }

  return (
    <section id="tutorial" className="scroll-mt-20 border-t border-border/80 bg-surface py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header + Role Switcher */}
        <div className="animate-rise flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">
              Interactive Animated Guide
            </p>
            <h2 className="mt-1.5 font-heading text-2xl font-black text-brand-navy sm:text-3xl">
              See how EventRegister works for everyone
            </h2>
            <p className="mt-1.5 text-sm text-brand-navy/70">
              Switch between the Attendee journey and the Door Staff check-in console. Click any
              step or let the walkthrough auto-play.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="inline-flex rounded-2xl border border-border bg-page p-1"
              role="tablist"
              aria-label="Tutorial role switcher"
            >
              <button
                type="button"
                role="tab"
                aria-selected={role === 'attendee'}
                onClick={() => handleRoleChange('attendee')}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-extrabold leading-none transition-all duration-150 sm:text-sm ${
                  role === 'attendee'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-navy/70 hover:text-brand-navy'
                }`}
              >
                <TicketCheck className="h-4 w-4 shrink-0" />
                <span>Attendee Guide</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'staff'}
                onClick={() => handleRoleChange('staff')}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-extrabold leading-none transition-all duration-150 sm:text-sm ${
                  role === 'staff'
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-brand-navy/70 hover:text-brand-navy'
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Door Staff Guide</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause tutorial auto-play' : 'Play tutorial auto-play'}
              className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-border bg-surface px-3.5 text-xs font-extrabold leading-none text-brand-navy transition-colors hover:bg-page"
            >
              {playing ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Play</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Split Stage */}
        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* Left: Step List */}
          <div className="flex flex-col justify-between gap-3 lg:col-span-5">
            {steps.map((item, idx) => {
              const active = idx === step
              const completed = idx < step
              return (
                <button
                  key={`${role}-${item.num}`}
                  type="button"
                  onClick={() => setStep(idx)}
                  className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                    active
                      ? 'border-brand-primary bg-sky-50/75 shadow-card'
                      : 'border-border/80 bg-page hover:border-brand-sky-end hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`font-code flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                        active
                          ? 'animate-pop bg-brand-primary text-white'
                          : completed
                            ? 'bg-emerald-50 text-status-green'
                            : 'bg-surface text-brand-navy/60 group-hover:text-brand-primary'
                      }`}
                    >
                      {completed ? <CheckCircle2 className="animate-tick h-4 w-4" /> : item.num}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`font-heading text-sm font-extrabold sm:text-base ${
                          completed
                            ? 'animate-strike inline-block text-brand-navy/60'
                            : 'text-brand-navy'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/70">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Auto-Play Progress Bar on Active Step */}
                  {active && playing && (
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-brand-sky">
                      <div
                        key={`prog-${role}-${step}`}
                        className="animate-dot-timer-fill h-full rounded-full bg-brand-primary"
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Animated Live UI Simulation Stage */}
          <div className="tutorial-stage relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[24px] p-5 text-white sm:p-7 lg:col-span-7">
            <div className="bg-hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

            {/* Top Stage Bar */}
            <div className="relative flex items-center justify-between gap-3 border-b border-white/15 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-cyan" />
                <span className="font-code text-xs font-semibold uppercase tracking-wider text-brand-sky">
                  {role === 'attendee' ? 'Attendee Flow' : 'Door Staff Console'} · Step {steps[step].num}
                </span>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/85">
                Asia/Manila (UTC+8)
              </span>
            </div>

            {/* Animated Scene Body */}
            <div
              key={`scene-${role}-${step}`}
              className="animate-modal-in relative my-auto py-5"
            >
              {role === 'attendee' ? (
                <AttendeeScene step={step} />
              ) : (
                <StaffScene step={step} />
              )}
            </div>

            {/* Bottom Step Timer Dots */}
            <div className="relative flex items-center justify-between border-t border-white/15 pt-3.5 text-xs text-white/70">
              <span>{steps[step].title}</span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((dot) => (
                  <button
                    key={dot}
                    type="button"
                    aria-label={`Jump to step ${dot + 1}`}
                    onClick={() => setStep(dot)}
                    className={`relative h-2 overflow-hidden rounded-full transition-all ${
                      dot === step ? 'w-7 bg-white/25' : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  >
                    {dot === step && playing && (
                      <span
                        key={`dot-${role}-${step}`}
                        className="animate-dot-timer-fill absolute inset-y-0 left-0 rounded-full bg-brand-cyan"
                      />
                    )}
                    {dot === step && !playing && (
                      <span className="absolute inset-0 rounded-full bg-brand-cyan" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AttendeeScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <span className="animate-chip-in inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-brand-primary">
            <span className="h-2 w-2 rounded-full bg-brand-primary" />
            Happening Today
          </span>
          <span className="font-code animate-highlight rounded px-1.5 py-0.5 text-xs font-bold text-brand-navy/75">
            CDM
          </span>
        </div>
        <h4 className="mt-3 font-heading text-lg font-extrabold">Cebu Dev Meetup 2026</h4>
        <p className="mt-1 text-xs text-brand-navy/70">
          8:00 AM – 10:00 PM · Ayala Center Cebu, Function Room 2
        </p>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span>27 of 30 spots left</span>
            <span className="text-brand-navy/50">10% filled</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[10%] rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <span className="btn-primary-gloss animate-pop inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold text-white">
            <span>Register Free</span>
            <span className="animate-nudge inline-block">→</span>
          </span>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-base font-extrabold">Attendee Registration</h4>
          <span className="animate-chip-in rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-status-green">
            Server Verified
          </span>
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2">
            <div>
              <span className="block text-[10px] font-semibold text-brand-navy/55">Full Name</span>
              <span className="font-bold">Juan Dela Cruz</span>
            </div>
            <CheckCircle2 className="animate-tick h-4 w-4 text-status-green" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2">
            <div>
              <span className="block text-[10px] font-semibold text-brand-navy/55">Email</span>
              <span className="font-bold">juan.delacruz@example.com</span>
            </div>
            <span className="animate-chip-in delay-75 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-status-green">
              Unique ✓
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2">
            <div>
              <span className="block text-[10px] font-semibold text-brand-navy/55">PH Mobile</span>
              <span className="font-code font-bold">09171234567</span>
            </div>
            <span className="animate-chip-in delay-150 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-status-green">
              11-digit 09 ✓
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/25 bg-white text-brand-navy shadow-2xl">
        <div className="bg-brand-navy px-4 py-3 text-white">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-brand-cyan">Cebu Dev Meetup 2026</span>
            <span className="animate-pop rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-200">
              CONFIRMED
            </span>
          </div>
          <p className="mt-1 font-heading text-sm font-extrabold">Juan Dela Cruz</p>
        </div>
        <div className="flex flex-col items-center p-5">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-sm">
            <QrCode className="h-20 w-20 text-brand-navy" strokeWidth={1.6} />
            <div className="animate-qr-beam pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_8px_#1951FC]" />
          </div>
          <p className="font-code animate-highlight mt-3 rounded-lg px-2.5 py-0.5 text-base font-bold tracking-widest text-brand-navy">
            CDM-7K3P9Q
          </p>
          <p className="mt-0.5 text-[11px] text-brand-navy/60">
            Show this QR code at the venue entrance
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
      <div className="flex items-center gap-2 text-brand-primary">
        <Search className="h-4 w-4" />
        <h4 className="font-heading text-base font-extrabold text-brand-navy">Find My Ticket</h4>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-page px-3 py-2 text-xs">
          <span className="block text-[10px] font-semibold text-brand-navy/55">Ticket Code</span>
          <span className="font-code font-bold">CDM-7K3P9Q</span>
        </div>
        <div className="rounded-xl border border-border bg-page px-3 py-2 text-xs">
          <span className="block text-[10px] font-semibold text-brand-navy/55">Email</span>
          <span className="truncate font-bold">juan.delacruz@example.com</span>
        </div>
      </div>
      <div className="animate-pop flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-status-green">
        <span className="font-bold">Match verified — QR ticket restored</span>
        <CheckCircle2 className="animate-tick h-4 w-4 shrink-0" />
      </div>
      <p className="text-[11px] text-brand-navy/60">
        Security rule: wrong combinations always return a neutral &ldquo;Ticket not found&rdquo; with
        zero personal details leaked.
      </p>
    </div>
  )
}

function StaffScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="mx-auto max-w-md space-y-3.5 rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-navy text-brand-cyan">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-extrabold">Staff Portal Sign-In</h4>
              <p className="text-[11px] text-brand-navy/60">Protected routes &amp; API</p>
            </div>
          </div>
          <span className="animate-chip-in rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
            401 Enforced
          </span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="rounded-xl border border-border bg-page px-3 py-2">
            <span className="block text-[10px] font-semibold text-brand-navy/55">Username</span>
            <span className="font-code font-bold">organizer</span>
          </div>
          <div className="rounded-xl border border-border bg-page px-3 py-2">
            <span className="block text-[10px] font-semibold text-brand-navy/55">Password</span>
            <span className="font-code tracking-widest">••••••••••••</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="animate-chip-in delay-75 rounded-full bg-emerald-50 px-2.5 py-1 text-status-green">
            ✓ BCrypt Hash Checked
          </span>
          <span className="animate-chip-in delay-150 rounded-full bg-sky-50 px-2.5 py-1 text-brand-primary">
            ✓ JWT Session Active
          </span>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-brand-navy/70">Event: Cebu Dev Meetup 2026</span>
          <span className="font-code animate-pop rounded-full bg-sky-50 px-2.5 py-0.5 font-bold text-brand-primary">
            4 / 30 Checked In
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-primary/40 bg-page px-3 py-2">
          <ScanLine className="h-4 w-4 text-brand-primary" />
          <span className="font-code animate-highlight rounded px-1 text-sm font-bold tracking-wider">
            CDM-7K3P9Q
          </span>
        </div>
        <div className="animate-pop rounded-2xl border-2 border-status-green/40 bg-emerald-50 p-4 text-status-green">
          <div className="flex items-center gap-2.5">
            <UserCheck className="animate-tick h-6 w-6 shrink-0" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider">CHECKED IN</p>
              <p className="font-heading text-base font-extrabold text-brand-navy">Juan Dela Cruz</p>
              <p className="text-[11px] font-semibold text-emerald-800">
                Checked in at 8:14 AM (Asia/Manila)
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-brand-navy/70">Second Scan Attempt</span>
          <span className="font-code font-bold text-brand-navy">CDM-7K3P9Q</span>
        </div>
        <div className="animate-pop rounded-2xl border-2 border-status-amber/40 bg-amber-50 p-4 text-status-amber">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="animate-tick h-6 w-6 shrink-0" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider">ALREADY CHECKED IN</p>
              <p className="font-heading text-base font-extrabold text-brand-navy">Juan Dela Cruz</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-amber-900">
                <Clock className="h-3.5 w-3.5" />
                <span>First checked in at 8:14 AM (Asia/Manila)</span>
              </p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-brand-navy/65">
          Rule R4: Each ticket checks in once; duplicate scans show yellow warning + original time.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-white/20 bg-white p-5 text-brand-navy shadow-2xl">
      <div className="animate-pop rounded-2xl border-2 border-status-red/40 bg-red-50 p-3.5 text-status-red">
        <div className="flex items-center gap-2.5">
          <XCircle className="animate-tick h-6 w-6 shrink-0" />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider">INVALID TICKET</p>
            <p className="text-xs font-semibold text-red-900">
              Unknown code <span className="font-code font-bold">CDM-ZZZZZZ</span> or wrong event selected
            </p>
          </div>
        </div>
      </div>

      <div className="animate-chip-in delay-150 rounded-xl border border-border bg-page p-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 text-brand-navy">
            <Users className="h-3.5 w-3.5 text-brand-primary" />
            Attendee List Totals
          </span>
          <span className="text-brand-primary">4 / 30 registered · 4 / 4 checked in</span>
        </div>
      </div>
    </div>
  )
}
