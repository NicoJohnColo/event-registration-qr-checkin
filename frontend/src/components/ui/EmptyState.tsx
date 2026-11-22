import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-border bg-surface px-6 py-12 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-brand-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-brand-navy">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-brand-navy/65">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
