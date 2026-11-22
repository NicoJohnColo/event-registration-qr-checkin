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
          <span className="pointer-events-none absolute left-3.5 text-brand-navy/45">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          value={value}
          className={`h-12 w-full rounded-[12px] border bg-surface text-sm text-brand-navy placeholder:text-brand-navy/40 transition-all duration-150 focus:outline-none focus:ring-4 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${showClear ? 'pr-10' : 'pr-3.5'} ${
            hasError
              ? 'border-status-red focus:border-status-red focus:ring-status-red/15'
              : 'border-border focus:border-brand-primary focus:ring-brand-primary/15'
          } ${className}`}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-brand-navy/50 transition-colors hover:bg-page hover:text-brand-navy"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
