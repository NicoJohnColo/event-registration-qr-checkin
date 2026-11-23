import { ArrowRight, Clock, Lock, MapPin, QrCode, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface HeroPassPreview {
  eventId?: number
  title: string
  scheduleLabel: string
  venue: string
  codeSample: string
  spotsLabel: string
}

export function HeroCubeScene({ preview }: { preview: HeroPassPreview }) {
  return (
    <div className="animate-float relative mx-auto w-full max-w-[490px]">
      {/* Orbiting Floating Micro-Badges */}
      <div className="animate-chip-in animate-hero-pulse pointer-events-none absolute -left-3 top-5 z-20 hidden items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md sm:inline-flex">
        <Clock className="h-3.5 w-3.5 text-brand-cyan" />
        <span>Asia/Manila UTC+8</span>
      </div>

      <div className="animate-chip-in delay-75 animate-hero-pulse pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/50 bg-brand-navy/70 px-3 py-1.5 text-[11px] font-semibold text-brand-cyan shadow-lg backdrop-blur-md sm:-right-2">
        <QrCode className="h-3.5 w-3.5" />
        <span>Instant QR</span>
      </div>

      <div className="animate-chip-in delay-150 pointer-events-none absolute -bottom-3 right-6 z-20 hidden items-center gap-1.5 rounded-full border border-white/30 bg-brand-navy/80 px-3 py-1.5 text-[11px] font-semibold text-brand-sky shadow-lg backdrop-blur-md sm:inline-flex">
        <Lock className="h-3.5 w-3.5 text-brand-cyan" />
        <span>BCrypt + JWT</span>
      </div>

      {/* Main Translucent Cube Stage */}
      <div className="glass-cube-stage animate-glow relative overflow-hidden rounded-[28px] p-5 sm:p-6">
        {/* Isometric 3D Translucent Glass Cube Cluster + Glowing Platform */}
        <div className="relative flex h-44 items-center justify-center sm:h-48" aria-hidden="true">
          <svg
            viewBox="0 0 360 200"
            className="h-full w-full drop-shadow-[0_14px_24px_rgba(3,25,91,0.45)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="pedestalRim" x1="60" y1="150" x2="300" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#00F0FF" stopOpacity="0.95" />
                <stop offset="1" stopColor="#40E0D0" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="cubeGlassBlue" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#CBE9FD" stopOpacity="0.85" />
                <stop offset="1" stopColor="#1951FC" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="cubeGlassRoyal" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#3B82F6" stopOpacity="0.72" />
                <stop offset="1" stopColor="#03195B" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="cubeGlassCyan" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#E0FBFF" stopOpacity="0.92" />
                <stop offset="1" stopColor="#00F0FF" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* Perspective Circuit Lines */}
            <path
              d="M32 162 L96 140 M328 162 L264 140 M180 188 L180 166"
              stroke="#00F0FF"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* Glowing Isometric Pedestal Base */}
            <g className="animate-pedestal-pulse">
              <ellipse cx="180" cy="154" rx="116" ry="28" fill="#00F0FF" fillOpacity="0.14" />
              <ellipse
                cx="180"
                cy="152"
                rx="106"
                ry="23"
                fill="#03195B"
                fillOpacity="0.5"
                stroke="url(#pedestalRim)"
                strokeWidth="2"
              />
              <ellipse
                cx="180"
                cy="148"
                rx="84"
                ry="16"
                fill="#FFFFFF"
                fillOpacity="0.12"
                stroke="#CBE9FD"
                strokeOpacity="0.6"
                strokeWidth="1.2"
              />
            </g>

            {/* Back-Left Translucent Cube (Sky / Cyan) */}
            <g className="animate-cube-c">
              <polygon points="116,66 148,50 180,66 148,82" fill="url(#cubeGlassCyan)" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.2" />
              <polygon points="116,66 148,82 148,118 116,102" fill="#1951FC" fillOpacity="0.52" stroke="#CBE9FD" strokeOpacity="0.7" strokeWidth="1.2" />
              <polygon points="148,82 180,66 180,102 148,118" fill="#0B2CB1" fillOpacity="0.66" stroke="#00F0FF" strokeOpacity="0.6" strokeWidth="1.2" />
            </g>

            {/* Back-Right Deep Royal Cube */}
            <g className="animate-cube-a">
              <polygon points="194,54 230,36 266,54 230,72" fill="#CBE9FD" fillOpacity="0.82" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="1.2" />
              <polygon points="194,54 230,72 230,114 194,96" fill="url(#cubeGlassBlue)" stroke="#CBE9FD" strokeOpacity="0.7" strokeWidth="1.2" />
              <polygon points="230,72 266,54 266,96 230,114" fill="url(#cubeGlassRoyal)" stroke="#00F0FF" strokeOpacity="0.55" strokeWidth="1.2" />
            </g>

            {/* Center Hero Frosted White/Blue Cube */}
            <g className="animate-cube-b">
              <polygon points="148,96 184,78 220,96 184,114" fill="#FFFFFF" fillOpacity="0.94" stroke="#FFFFFF" strokeWidth="1.4" />
              <polygon points="148,96 184,114 184,152 148,134" fill="#CBE9FD" fillOpacity="0.84" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.2" />
              <polygon points="184,114 220,96 220,134 184,152" fill="#3781FC" fillOpacity="0.78" stroke="#00F0FF" strokeOpacity="0.8" strokeWidth="1.2" />
            </g>

            {/* Floating Top Small Cyan Cube */}
            <g className="animate-cube-b">
              <polygon points="168,20 184,12 200,20 184,28" fill="#E0FBFF" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="1" />
              <polygon points="168,20 184,28 184,46 168,38" fill="#00F0FF" fillOpacity="0.55" stroke="#CBE9FD" strokeWidth="1" />
              <polygon points="184,28 200,20 200,38 184,46" fill="#1951FC" fillOpacity="0.68" stroke="#00F0FF" strokeWidth="1" />
            </g>

            {/* Front-Right Accent Mini Cube */}
            <g className="animate-cube-c">
              <polygon points="242,108 262,98 282,108 262,118" fill="#CBE9FD" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="1" />
              <polygon points="242,108 262,118 262,140 242,130" fill="#1951FC" fillOpacity="0.62" stroke="#CBE9FD" strokeWidth="1" />
              <polygon points="262,118 282,108 282,130 262,140" fill="#03195B" fillOpacity="0.82" stroke="#00F0FF" strokeOpacity="0.7" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Live Featured Boarding Pass Card */}
        <div className="mt-2 rounded-[20px] border border-white/25 bg-brand-navy/65 p-4 text-white shadow-inner backdrop-blur-md">
          <div className="flex items-start justify-between gap-2 pb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-cyan">
                Live Featured Pass
              </p>
              <h2 className="mt-0.5 truncate font-heading text-base font-extrabold text-white">
                {preview.title}
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100">
              Confirmed
            </span>
          </div>

          <div className="ticket-notch grid grid-cols-1 items-center gap-3 pt-3 sm:grid-cols-12">
            <div className="space-y-2 text-xs text-white/85 sm:col-span-7">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                <span className="truncate">{preview.scheduleLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                <span className="truncate">{preview.venue}</span>
              </div>
              <div className="pt-0.5">
                <p className="text-[10px] uppercase tracking-wider text-white/60">Sample Code</p>
                <p className="font-code text-sm font-bold tracking-wider text-white">
                  {preview.codeSample}
                </p>
              </div>
            </div>

            {/* QR Tile with Animated Scan Laser */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-brand-navy sm:col-span-5">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg">
                <QrCode className="h-14 w-14 text-brand-navy" strokeWidth={1.6} />
                <div
                  className="animate-qr-beam pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-[0_0_8px_#00F0FF]"
                  aria-hidden="true"
                />
              </div>
              <span className="font-code mt-1 text-[9px] font-bold tracking-wider text-brand-primary">
                SCAN AT DOOR
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
            <span className="font-semibold text-brand-sky">{preview.spotsLabel}</span>
            {preview.eventId !== undefined && (
              <Link
                to={`/events/${preview.eventId}`}
                className="inline-flex items-center gap-1 font-semibold text-brand-cyan transition-colors hover:text-white"
              >
                <span>Open details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Compact floating translucent cubes accent for secondary page headers. */
export function FloatingCubeAccent() {
  return (
    <div className="pointer-events-none hidden select-none lg:block" aria-hidden="true">
      <svg width="132" height="96" viewBox="0 0 132 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="animate-cube-a">
          <polygon points="34,26 56,15 78,26 56,37" fill="#FFFFFF" fillOpacity="0.92" stroke="#CBE9FD" strokeWidth="1.2" />
          <polygon points="34,26 56,37 56,63 34,52" fill="#CBE9FD" fillOpacity="0.85" stroke="#FFFFFF" strokeWidth="1.1" />
          <polygon points="56,37 78,26 78,52 56,63" fill="#1951FC" fillOpacity="0.72" stroke="#00F0FF" strokeWidth="1.1" />
        </g>
        <g className="animate-cube-b">
          <polygon points="82,42 98,34 114,42 98,50" fill="#E0FBFF" fillOpacity="0.9" stroke="#FFFFFF" strokeWidth="1" />
          <polygon points="82,42 98,50 98,69 82,61" fill="#40E0D0" fillOpacity="0.55" stroke="#FFFFFF" strokeWidth="1" />
          <polygon points="98,50 114,42 114,61 98,69" fill="#0B2CB1" fillOpacity="0.75" stroke="#00F0FF" strokeWidth="1" />
        </g>
        <g className="animate-cube-c">
          <circle cx="24" cy="70" r="3" fill="#1951FC" fillOpacity="0.35" />
          <circle cx="116" cy="22" r="2.5" fill="#00F0FF" fillOpacity="0.8" />
        </g>
      </svg>
    </div>
  )
}

export function HeroSecurityPill() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/75">
      <ShieldCheck className="h-3.5 w-3.5 text-brand-cyan" />
      <span>Server-verified capacity &amp; duplicate protection</span>
    </span>
  )
}
