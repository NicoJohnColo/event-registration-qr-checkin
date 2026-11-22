import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertTone = 'error' | 'success' | 'info'

interface AlertProps {
  tone?: AlertTone
  title?: string
  children: ReactNode
  action?: ReactNode
}

const toneStyles: Record<AlertTone, { box: string; icon: ReactNode }> = {
  error: {
    box: 'border-status-red/30 bg-red-50 text-status-red',
    icon: <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />,
  },
  success: {
    box: 'border-status-green/30 bg-emerald-50 text-status-green',
    icon: <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />,
  },
  info: {
    box: 'border-brand-sky bg-sky-50 text-brand-navy',
    icon: <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />,
  },
}

export function Alert({ tone = 'info', title, children, action }: AlertProps) {
  const style = toneStyles[tone]
  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${style.box}`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="text-sm">
          {title && <p className="font-semibold">{title}</p>}
          <div className={title ? 'mt-0.5' : ''}>{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
