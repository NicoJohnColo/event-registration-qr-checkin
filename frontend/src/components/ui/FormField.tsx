import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-xs font-bold text-brand-navy">
        {label}
        {required && <span className="ml-0.5 text-status-red">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] font-semibold text-status-red" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-brand-navy/70">{hint}</p>
      ) : null}
    </div>
  )
}
