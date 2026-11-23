import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Search, Ticket } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { ApiClientError } from '../../../lib/apiClient'
import { useTicketLookup } from '../hooks'
import { ticketLookupSchema, type TicketLookupFormValues } from '../schema'
import type { TicketData } from '../types'

interface LookupFormProps {
  initialCode?: string
  onFound: (ticket: TicketData) => void
  title?: string
  subtitle?: string
}

export function LookupForm({
  initialCode = '',
  onFound,
  title = 'Find your QR ticket',
  subtitle = 'Enter your ticket code and the email used during registration.',
}: LookupFormProps) {
  const mutation = useTicketLookup()

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TicketLookupFormValues>({
    resolver: zodResolver(ticketLookupSchema),
    defaultValues: {
      ticketCode: initialCode.trim().toUpperCase(),
      email: '',
    },
  })

  useEffect(() => {
    if (initialCode) {
      setValue('ticketCode', initialCode.trim().toUpperCase())
    }
  }, [initialCode, setValue])

  const onSubmit = (values: TicketLookupFormValues) => {
    mutation.mutate(
      {
        ticketCode: values.ticketCode.trim(),
        email: values.email.trim(),
      },
      {
        onSuccess: (ticket) => {
          onFound(ticket)
        },
        onError: (err) => {
          if (err instanceof ApiClientError && Object.keys(err.fieldErrors).length > 0) {
            Object.entries(err.fieldErrors).forEach(([field, message]) => {
              if (field === 'ticketCode' || field === 'email') {
                setError(field, { message })
              }
            })
          }
        },
      },
    )
  }

  const apiError = mutation.error
  const isNotFound = apiError instanceof ApiClientError && apiError.status === 404
  const showTopAlert =
    apiError &&
    !(apiError instanceof ApiClientError && Object.keys(apiError.fieldErrors).length > 0)

  return (
    <div className="rounded-[24px] border border-border bg-surface p-5 shadow-dock sm:p-7">
      <div className="mb-5">
        <h2 className="font-heading text-xl font-extrabold text-brand-navy">{title}</h2>
        <p className="mt-1 text-sm text-brand-navy/70">{subtitle}</p>
      </div>

      {showTopAlert && (
        <div className="mb-5">
          <Alert
            tone="error"
            title={isNotFound ? 'Ticket not found' : 'Could not look up ticket'}
          >
            {isNotFound
              ? 'No matching ticket was found for that code and email. Please double-check both fields and try again.'
              : apiError instanceof Error
                ? apiError.message
                : 'Please check your details and try again.'}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Ticket Code"
          htmlFor="lookup-ticket-code"
          error={errors.ticketCode?.message}
          hint="Example: CDM-7K3P9Q"
          required
        >
          <Input
            id="lookup-ticket-code"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="CDM-7K3P9Q"
            className="font-code uppercase tracking-wider"
            leftIcon={<Ticket className="h-4 w-4" />}
            hasError={Boolean(errors.ticketCode)}
            {...register('ticketCode')}
          />
        </FormField>

        <FormField
          label="Registered Email"
          htmlFor="lookup-email"
          error={errors.email?.message}
          required
        >
          <Input
            id="lookup-email"
            type="email"
            autoComplete="email"
            placeholder="juan.delacruz@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            hasError={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Find My Ticket</span>
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
