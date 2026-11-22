import { ArrowLeft, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

interface PhaseComingSoonPageProps {
  phase: string
  title: string
  description: string
}

export function PhaseComingSoonPage({ phase, title, description }: PhaseComingSoonPageProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-[20px] border border-border bg-surface p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-brand-primary">
          <Wrench className="h-6 w-6" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
          {phase}
        </p>
        <h1 className="mt-1.5 font-heading text-2xl font-bold text-brand-navy">{title}</h1>
        <p className="mt-2 text-sm text-brand-navy/70">{description}</p>
        <div className="mt-6">
          <Link to="/events">
            <Button variant="outline" size="md">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
