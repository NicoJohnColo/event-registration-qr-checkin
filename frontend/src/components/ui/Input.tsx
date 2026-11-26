import { X } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  leftIcon?: ReactNode
  onClear?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, leftIcon, onClear, className = '', value, ...props }, ref) => {
    const showClear = Boolean(onClear && value !== undefined && String(value).length > 0)

    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-brand-navy/65">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          value={value}
          className={`h-[var(--control-h)] min-h-[40px] w-full rounded-[var(--radius-control)] border bg-[#F3F5F9] text-base text-brand-navy placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-3 sm:text-sm ${
            leftIcon ? 'pl-9' : 'pl-3'
          } ${showClear ? 'pr-9.5' : 'pr-3.5'} ${
            hasError
              ? 'border-status-red focus:border-status-red focus:ring-status-red/15'
              : 'border-transparent focus:border-brand-primary focus:bg-white focus:ring-brand-primary/15'
          } ${className}`}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-brand-navy/65 transition-colors hover:bg-page hover:text-brand-navy"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
