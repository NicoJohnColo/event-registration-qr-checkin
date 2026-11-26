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
    <form onSubmit={handleSubmit} className="space-y-1.5" noValidate>
      <label htmlFor="checkin-ticket-code" className="block text-xs font-bold text-brand-navy">
        Ticket Code
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-primary" />
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
            placeholder="CDM-7K3P9Q or scan QR"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus
            disabled={disabled}
            className={`font-code h-[var(--control-h)] min-h-[40px] w-full rounded-[var(--radius-control)] border bg-[#F3F5F9] pl-8.5 pr-10 text-base font-bold uppercase tracking-wider text-brand-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none focus:ring-3 sm:text-sm ${
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
          className="shrink-0 px-4"
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
        <p className="text-xs font-semibold text-status-red" role="alert">
          {localError}
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-brand-navy/75">
          Supports short ticket codes and signed QR passes cleanly. Press Enter after typing or scanning.
        </p>
      )}
    </form>
  )
}
