import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-12 text-sm font-medium text-brand-navy/70">
      <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
      <span>{label}</span>
    </div>
  )
}
