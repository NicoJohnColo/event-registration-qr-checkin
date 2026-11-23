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
  shortLabel: string
  title: string
  subtitle: string
}

const ATTENDEE_STEPS: StepInfo[] = [
  {
    num: '01',
    shortLabel: 'Pick',
    title: 'Pick a Cebu Event',
    subtitle: 'Check real-time spots left & 12-hour Cebu schedule',
  },
  {
    num: '02',
    shortLabel: 'Register',
    title: '30-Second PH Registration',
    subtitle: 'Validated email + 11-digit PH mobile (09XXXXXXXXX)',
  },
  {
    num: '03',
    shortLabel: 'QR Pass',
    title: 'Instant QR Boarding Pass',
    subtitle: 'Unique ticket code + mobile QR ready for the entrance',
  },
  {
    num: '04',
    shortLabel: 'Lookup',
    title: 'Anytime Ticket Lookup',
    subtitle: 'Retrieve your pass with ticket code + email without leaks',
  },
]

const STAFF_STEPS: StepInfo[] = [
  {
    num: '01',
    shortLabel: 'Sign In',
    title: 'Protected Staff Sign-In',
    subtitle: 'BCrypt + JWT auth enforced on both routes and API',
  },
  {
    num: '02',
    shortLabel: 'Check In',
    title: 'Valid Scan → Green Checked In',
    subtitle: 'Select event, scan/enter code — attendee checked in',
  },
  {
    num: '03',
    shortLabel: 'Duplicate',
    title: 'Duplicate Scan → Yellow Warning',
    subtitle: 'Shows "Already checked in" with the first check-in time',
  },
  {
    num: '04',
    shortLabel: 'Guard',
    title: 'Invalid Guard & Attendee List',
    subtitle: 'Unknown or wrong-event codes show Red + live totals',
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
    <section id="tutorial" className="scroll-mt-16 border-y border-border bg-white py-6 sm:py-8">
      <div className="page-container">
        {/* Header + Role Switcher */}
        <div className="animate-rise flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-end justify-between gap-2.5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">
                Interactive Guide
              </p>
              <h2 className="heading-section mt-0.5 font-heading font-extrabold text-brand-navy">
                How EventRegister works
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause tutorial auto-play' : 'Play tutorial auto-play'}
              className="inline-flex h-8.5 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-2.5 text-[11px] font-bold text-brand-navy transition-colors hover:bg-page md:hidden"
            >
              {playing ? (
                <>
                  <Pause className="h-3 w-3 text-brand-primary" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-brand-primary" />
                  <span>Play</span>
                </>
              )}
            </button>
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <div
              className="grid w-full grid-cols-2 gap-1 rounded-[var(--radius-control)] border border-border bg-page p-1 md:w-auto"
              role="tablist"
              aria-label="Tutorial role switcher"
            >
              <button
                type="button"
                role="tab"
                aria-selected={role === 'attendee'}
                onClick={() => handleRoleChange('attendee')}
                className={`inline-flex h-8.5 min-w-0 items-center justify-center gap-1.5 rounded-[8px] px-2.5 text-[11px] font-bold leading-none transition-all duration-150 sm:px-3 sm:text-xs ${
                  role === 'attendee'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-brand-navy/80 hover:text-brand-navy'
                }`}
              >
                <TicketCheck className="hidden h-3.5 w-3.5 shrink-0 min-[360px]:inline-block" />
                <span className="truncate xs:hidden">Attendee</span>
                <span className="hidden truncate xs:inline">Attendee Guide</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'staff'}
                onClick={() => handleRoleChange('staff')}
                className={`inline-flex h-8.5 min-w-0 items-center justify-center gap-1.5 rounded-[8px] px-2.5 text-[11px] font-bold leading-none transition-all duration-150 sm:px-3 sm:text-xs ${
                  role === 'staff'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-brand-navy/80 hover:text-brand-navy'
                }`}
              >
                <ShieldCheck className="hidden h-3.5 w-3.5 shrink-0 min-[360px]:inline-block" />
                <span className="truncate xs:hidden">Door Staff</span>
                <span className="hidden truncate xs:inline">Door Staff Guide</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause tutorial auto-play' : 'Play tutorial auto-play'}
              className="hidden h-8.5 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-3 text-xs font-bold text-brand-navy transition-colors hover:bg-page md:inline-flex"
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

        {/* Split Layout */}
        <div className="mt-4 grid grid-cols-1 items-stretch gap-3 lg:grid-cols-12">
          {/* Step Selector: 4-column equal-width grid on Mobile, vertical stack on Desktop */}
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-5">
            {/* Mobile 4-Column Step Tabs */}
            <div className="space-y-2 lg:hidden">
              <div className="grid grid-cols-4 gap-1.5">
                {steps.map((item, idx) => {
                  const active = idx === step
                  return (
                    <button
                      key={`mob-${role}-${item.num}`}
                      type="button"
                      onClick={() => setStep(idx)}
                      className={`flex min-h-[48px] min-w-0 flex-col items-center justify-center rounded-[var(--radius-control)] border px-1.5 py-1.5 text-center transition-all ${
                        active
                          ? 'border-brand-primary bg-sky-50 text-brand-primary shadow-xs'
                          : 'border-border/80 bg-page text-brand-navy/75'
                      }`}
                    >
                      <span className="font-code text-[11px] font-bold">{item.num}</span>
                      <span className="mt-0.5 w-full truncate text-xs font-bold">
                        {item.shortLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex h-[76px] flex-col justify-between rounded-[var(--radius-control)] border border-border/80 bg-page px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-brand-navy">{steps[step].title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-brand-navy/75">
                    {steps[step].subtitle}
                  </p>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-brand-sky">
                  <div
                    key={`mob-prog-${role}-${step}-${playing}`}
                    className={`h-full rounded-full bg-brand-primary ${
                      playing ? 'animate-dot-timer-fill' : 'w-full'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Step List */}
            <div className="hidden flex-col justify-between gap-2 lg:flex lg:h-[336px]">
              {steps.map((item, idx) => {
                const active = idx === step
                const completed = idx < step
                return (
                  <button
                    key={`${role}-${item.num}`}
                    type="button"
                    onClick={() => setStep(idx)}
                    className={`group relative flex-1 overflow-hidden rounded-[var(--radius-card)] border px-3 py-2 text-left transition-all duration-200 ${
                      active
                        ? 'border-brand-primary bg-sky-50/75 shadow-card'
                        : 'border-border/80 bg-page hover:border-brand-sky-end hover:bg-surface'
                    }`}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`font-code flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            active
                              ? 'animate-pop bg-brand-primary text-white'
                              : completed
                                ? 'bg-emerald-50 text-status-green'
                                : 'bg-surface text-brand-navy/70 group-hover:text-brand-primary'
                          }`}
                        >
                          {completed ? <CheckCircle2 className="animate-tick h-3.5 w-3.5" /> : item.num}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className={`font-heading truncate text-xs font-bold leading-tight sm:text-sm ${
                              completed
                                ? 'animate-strike inline-block text-brand-navy/65'
                                : 'text-brand-navy'
                            }`}
                          >
                            {item.title}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-brand-navy/75">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`mt-1.5 h-1 w-full overflow-hidden rounded-full ${
                          active ? 'bg-brand-sky' : 'bg-transparent'
                        }`}
                      >
                        {active && (
                          <div
                            key={`prog-${role}-${step}-${playing}`}
                            className={`h-full rounded-full bg-brand-primary ${
                              playing ? 'animate-dot-timer-fill' : 'w-full'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Animated Live UI Simulation Stage (fixed height at every breakpoint so switching steps never shifts or reshapes) */}
          <div className="tutorial-stage order-1 relative flex h-[336px] min-w-0 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] p-3.5 text-white sm:p-4 lg:order-2 lg:col-span-7">
            <div className="bg-hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

            {/* Top Stage Bar */}
            <div className="relative flex h-7 shrink-0 items-center justify-between gap-2 border-b border-white/15 pb-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-cyan" />
                <span className="font-code truncate text-xs font-semibold uppercase tracking-wider text-brand-sky">
                  {role === 'attendee' ? 'Attendee Flow' : 'Door Staff Console'} · Step {steps[step].num}
                </span>
              </div>
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                Asia/Manila (UTC+8)
              </span>
            </div>

            {/* Animated Scene Body */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden py-2">
              <div key={`scene-${role}-${step}`} className="w-full min-w-0">
                {role === 'attendee' ? <AttendeeScene step={step} /> : <StaffScene step={step} />}
              </div>
            </div>

            {/* Bottom Step Timer Dots */}
            <div className="relative flex h-8 shrink-0 items-center justify-between gap-2 border-t border-white/15 pt-2 text-xs text-white/85">
              <span className="min-w-0 truncate font-semibold">{steps[step].title}</span>
              <div className="flex shrink-0 items-center gap-1">
                {[0, 1, 2, 3].map((dot) => (
                  <button
                    key={dot}
                    type="button"
                    aria-label={`Jump to step ${dot + 1}`}
                    onClick={() => setStep(dot)}
                    className="inline-flex min-h-[32px] min-w-[24px] items-center justify-center px-0.5"
                  >
                    <span
                      className={`relative block h-2 overflow-hidden rounded-full transition-all ${
                        dot === step ? 'w-7 bg-white/25' : 'w-2 bg-white/35 hover:bg-white/60'
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
                    </span>
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

const SCENE_CARD_CLASS =
  'flex h-[206px] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-white/20 bg-white p-3 text-brand-navy shadow-2xl sm:p-3.5'

function AttendeeScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className={SCENE_CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <span className="animate-chip-in inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-brand-primary">
            <span className="h-2 w-2 rounded-full bg-brand-primary" />
            Happening Today
          </span>
          <span className="font-code animate-highlight rounded px-1.5 py-0.5 text-xs font-bold text-brand-navy/80">
            CDM
          </span>
        </div>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="min-w-0">
            <h4 className="font-heading truncate text-base font-extrabold sm:text-lg">
              Cebu Dev Meetup 2026
            </h4>
            <p className="mt-0.5 truncate text-xs text-brand-navy/75">
              Nov 23, 2026 · 8:00 AM – 10:00 PM · Ayala Center Cebu
            </p>
          </div>
          <span className="btn-primary-gloss animate-pop inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white">
            <span>Register Free</span>
            <span className="animate-nudge inline-block">→</span>
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-2 text-xs font-bold">
            <span>27 of 30 spots left</span>
            <span className="text-brand-navy/65">10% filled</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[10%] rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan" />
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className={SCENE_CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading truncate text-base font-extrabold">Attendee Registration</h4>
          <span className="animate-chip-in shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-status-green">
            Server Verified
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-3 sm:gap-2">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-1.5 sm:block sm:py-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-brand-navy/65">Full Name</span>
              <span className="block truncate font-bold">Juan Dela Cruz</span>
            </div>
            <CheckCircle2 className="animate-tick h-4 w-4 shrink-0 text-status-green sm:mt-1" />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-1.5 sm:block sm:py-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-brand-navy/65">Email</span>
              <span className="block truncate font-bold">juan.delacruz@example.com</span>
            </div>
            <span className="animate-chip-in delay-75 inline-block shrink-0 rounded-full bg-emerald-100/80 px-2 py-0.5 text-xs font-bold text-status-green sm:mt-1">
              Unique ✓
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-1.5 sm:block sm:py-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-brand-navy/65">PH Mobile</span>
              <span className="font-code block font-bold">09171234567</span>
            </div>
            <span className="animate-chip-in delay-150 inline-block shrink-0 rounded-full bg-emerald-100/80 px-2 py-0.5 text-xs font-bold text-status-green sm:mt-1">
              11-digit 09 ✓
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex h-[206px] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-white/25 bg-white text-brand-navy shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-2 bg-brand-navy px-3.5 py-2 text-white sm:px-4">
          <span className="truncate text-xs font-bold uppercase tracking-wider text-brand-cyan">
            Cebu Dev Meetup 2026
          </span>
          <span className="animate-pop shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
            CONFIRMED
          </span>
        </div>
        <div className="flex flex-1 items-center justify-between gap-3 px-3.5 py-2.5 sm:gap-4 sm:px-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/65">
              Attendee Pass
            </p>
            <p className="font-heading truncate text-base font-black text-brand-navy sm:text-lg">
              Juan Dela Cruz
            </p>
            <p className="truncate text-xs text-brand-navy/75">
              Nov 23, 2026 · 8:00 AM – 10:00 PM
            </p>
            <div className="pt-1">
              <p className="font-code animate-highlight inline-block max-w-full rounded-lg px-2.5 py-1 text-[clamp(0.9rem,4vw,1.1rem)] font-bold tracking-wider text-brand-navy">
                CDM-7K3P9Q
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-page p-2">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-xs sm:h-16 sm:w-16">
              <QrCode className="h-12 w-12 text-brand-navy sm:h-14 sm:w-14" strokeWidth={1.6} />
              <div className="animate-qr-beam pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_8px_#1951FC]" />
            </div>
            <span className="mt-1 whitespace-nowrap text-xs font-bold text-brand-primary">
              Show at door
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={SCENE_CARD_CLASS}>
      <div className="flex items-center gap-2 text-brand-primary">
        <Search className="h-4 w-4 shrink-0" />
        <h4 className="font-heading text-base font-extrabold text-brand-navy">Find My Ticket</h4>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl border border-border bg-page px-3 py-2 text-xs">
          <span className="block text-xs font-semibold text-brand-navy/65">Ticket Code</span>
          <span className="font-code block truncate font-bold">CDM-7K3P9Q</span>
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-page px-3 py-2 text-xs">
          <span className="block text-xs font-semibold text-brand-navy/65">Email</span>
          <span className="block truncate font-bold">juan.delacruz@example.com</span>
        </div>
      </div>
      <div className="animate-pop flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-status-green">
        <span className="truncate font-bold">Match verified — QR ticket restored</span>
        <CheckCircle2 className="animate-tick h-4 w-4 shrink-0" />
      </div>
      <p className="line-clamp-1 text-xs text-brand-navy/70">
        Wrong combinations return &ldquo;Ticket not found&rdquo; with zero details leaked.
      </p>
    </div>
  )
}

function StaffScene({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className={SCENE_CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-cyan">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-heading truncate text-sm font-extrabold">Staff Portal Sign-In</h4>
              <p className="truncate text-xs text-brand-navy/70">Protected routes &amp; API</p>
            </div>
          </div>
          <span className="animate-chip-in shrink-0 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-brand-primary">
            401 Enforced
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="min-w-0 rounded-xl border border-border bg-page px-3 py-2">
            <span className="block text-xs font-semibold text-brand-navy/65">Username</span>
            <span className="font-code block truncate font-bold">organizer</span>
          </div>
          <div className="min-w-0 rounded-xl border border-border bg-page px-3 py-2">
            <span className="block text-xs font-semibold text-brand-navy/65">Password</span>
            <span className="font-code block truncate tracking-widest">••••••••••••</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
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
      <div className={SCENE_CARD_CLASS}>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-bold text-brand-navy/75">Event: Cebu Dev Meetup 2026</span>
          <span className="font-code animate-pop shrink-0 rounded-full bg-sky-50 px-2.5 py-0.5 font-bold text-brand-primary">
            4 / 30 Checked In
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-primary/40 bg-page px-3 py-2">
          <ScanLine className="h-4 w-4 shrink-0 text-brand-primary" />
          <span className="font-code animate-highlight rounded px-1 text-sm font-bold tracking-wider">
            CDM-7K3P9Q
          </span>
        </div>
        <div className="animate-pop rounded-2xl border-2 border-status-green/40 bg-emerald-50 p-3 text-status-green">
          <div className="flex items-center gap-2.5">
            <UserCheck className="animate-tick h-6 w-6 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wider">CHECKED IN</p>
              <p className="font-heading truncate text-base font-extrabold text-brand-navy">Juan Dela Cruz</p>
              <p className="truncate text-xs font-semibold text-emerald-800">
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
      <div className={SCENE_CARD_CLASS}>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-bold text-brand-navy/75">Second Scan Attempt</span>
          <span className="font-code shrink-0 font-bold text-brand-navy">CDM-7K3P9Q</span>
        </div>
        <div className="animate-pop rounded-2xl border-2 border-status-amber/40 bg-amber-50 p-3 text-status-amber">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="animate-tick h-6 w-6 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wider">ALREADY CHECKED IN</p>
              <p className="font-heading truncate text-base font-extrabold text-brand-navy">Juan Dela Cruz</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-bold text-amber-900">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">First checked in at 8:14 AM (Asia/Manila)</span>
              </p>
            </div>
          </div>
        </div>
        <p className="line-clamp-1 text-xs text-brand-navy/75">
          Rule R4: Duplicate scans show yellow warning + original check-in time.
        </p>
      </div>
    )
  }

  return (
    <div className={SCENE_CARD_CLASS}>
      <div className="animate-pop rounded-2xl border-2 border-status-red/40 bg-red-50 p-3 text-status-red">
        <div className="flex items-center gap-2.5">
          <XCircle className="animate-tick h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wider">INVALID TICKET</p>
            <p className="text-xs font-semibold text-red-900">
              Unknown code <span className="font-code font-bold">CDM-ZZZZZZ</span> or wrong event selected
            </p>
          </div>
        </div>
      </div>

      <div className="animate-chip-in delay-150 rounded-xl border border-border bg-page p-3">
        <div className="flex flex-col gap-1 text-xs font-bold sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5 text-brand-navy">
            <Users className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
            Attendee List Totals
          </span>
          <span className="text-brand-primary">4 / 30 registered · 4 / 4 checked in</span>
        </div>
      </div>
    </div>
  )
}
