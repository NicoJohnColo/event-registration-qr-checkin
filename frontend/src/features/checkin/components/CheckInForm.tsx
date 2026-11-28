import { Loader2, ScanLine } from 'lucide-react'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'

interface CheckInFormProps {
  onSubmitCode: (ticketCode: string) => void
  isPending: boolean
  disabled?: boolean
  headerAction?: ReactNode
}

export function CheckInForm({
  onSubmitCode,
  isPending,
  disabled = false,
  headerAction,
}: CheckInFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-1.5" noValidate>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="checkin-ticket-code"
          className="block text-[11px] font-bold text-brand-navy sm:text-xs"
        >
          Ticket Code
        </label>
        {headerAction}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative min-w-0 flex-1">
          <ScanLine className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-primary sm:left-3" />
          <input
            ref={inputRef}
            id="checkin-ticket-code"
            type="text"
            inputMode="text"
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
            className={`font-code h-[var(--control-h)] w-full rounded-[var(--radius-control)] border bg-[#F3F5F9] pl-8 pr-2.5 text-xs font-bold uppercase tracking-wider text-brand-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none focus:ring-3 sm:pl-8.5 sm:pr-4 sm:text-sm ${
              localError
                ? 'border-status-red focus:border-status-red focus:ring-status-red/15'
                : 'border-transparent focus:border-brand-primary focus:bg-white focus:ring-brand-primary/15'
            }`}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={disabled || isPending}
          className="shrink-0 px-3 sm:px-4"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
              <span>Checking...</span>
            </>
          ) : (
            <span>Check In</span>
          )}
        </Button>
      </div>

      {localError ? (
        <p className="text-[11px] font-semibold text-status-red sm:text-xs" role="alert">
          {localError}
        </p>
      ) : (
        <p className="text-[10.5px] leading-snug text-brand-navy/65 sm:text-xs">
          Enter code manually or scan QR pass cleanly. Press Enter to verify.
        </p>
      )}
    </form>
  )
}
