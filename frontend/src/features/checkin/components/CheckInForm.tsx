import { Loader2, ScanLine } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'

interface CheckInFormProps {
  onSubmitCode: (ticketCode: string) => void
  isPending: boolean
  disabled?: boolean
}

export function CheckInForm({ onSubmitCode, isPending, disabled = false }: CheckInFormProps) {
  const [code, setCode] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setLocalError('Enter or scan a ticket code.')
      inputRef.current?.focus()
      return
    }
    setLocalError(null)
    onSubmitCode(trimmed)
    setCode('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" noValidate>
      <label htmlFor="checkin-ticket-code" className="block text-sm font-semibold text-brand-navy">
        Ticket Code
      </label>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <ScanLine className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-primary" />
          <input
            ref={inputRef}
            id="checkin-ticket-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              if (localError) setLocalError(null)
            }}
            placeholder="CDM-7K3P9Q"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus
            disabled={disabled}
            className={`font-code h-14 w-full rounded-[12px] border bg-surface pl-12 pr-4 text-lg font-bold uppercase tracking-widest text-brand-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-brand-navy/35 focus:outline-none focus:ring-4 ${
              localError
                ? 'border-status-red focus:border-status-red focus:ring-status-red/15'
                : 'border-border focus:border-brand-primary focus:ring-brand-primary/15'
            }`}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={disabled || isPending}
          className="h-14 shrink-0 px-7 text-base"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <span>Check In</span>
          )}
        </Button>
      </div>

      {localError ? (
        <p className="text-xs font-medium text-status-red" role="alert">
          {localError}
        </p>
      ) : (
        <p className="text-xs text-brand-navy/60">
          Case-insensitive &amp; whitespace trimmed automatically. Press Enter after typing or scanning.
        </p>
      )}
    </form>
  )
}
