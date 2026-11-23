import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export type ResultTone = 'green' | 'yellow' | 'red'

interface ResultBannerProps {
  tone: ResultTone
  label: string
  title?: string | null
  detail?: string | null
  meta?: string | null
}

const toneConfig: Record<
  ResultTone,
  {
    wrapper: string
    badge: string
    icon: typeof CheckCircle2
  }
> = {
  green: {
    wrapper: 'border-status-green/45 bg-emerald-50 text-status-green',
    badge: 'bg-status-green text-white',
    icon: CheckCircle2,
  },
  yellow: {
    wrapper: 'border-status-amber/45 bg-amber-50 text-amber-900',
    badge: 'bg-status-amber text-white',
    icon: AlertTriangle,
  },
  red: {
    wrapper: 'border-status-red/45 bg-red-50 text-status-red',
    badge: 'bg-status-red text-white',
    icon: XCircle,
  },
}

export function ResultBanner({ tone, label, title, detail, meta }: ResultBannerProps) {
  const { wrapper, badge, icon: Icon } = toneConfig[tone]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-pop rounded-[var(--radius-card)] border-2 p-3.5 shadow-card sm:p-4 ${wrapper}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badge}`}
          >
            {label}
          </span>

          {title && (
            <p className="heading-card mt-1 font-heading font-extrabold text-brand-navy">
              {title}
            </p>
          )}

          {detail && (
            <p className="mt-0.5 text-xs font-semibold text-brand-navy/85 sm:text-sm">{detail}</p>
          )}

          {meta && (
            <p className="font-code mt-1 text-xs font-semibold text-brand-navy/75">{meta}</p>
          )}
        </div>
      </div>
    </div>
  )
}
