import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Mail, Phone, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { ApiClientError } from '../../../lib/apiClient'
import { useRegisterForEvent } from '../hooks'
import { registerSchema, type RegisterFormValues } from '../schema'
import type { TicketData } from '../types'

interface RegistrationFormProps {
  eventId: number | string
  isWaitlist?: boolean
  onSuccess: (ticket: TicketData) => void
}

export function RegistrationForm({
  eventId,
  isWaitlist = false,
  onSuccess,
}: RegistrationFormProps) {
  const mutation = useRegisterForEvent(eventId)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const ticket = await mutation.mutateAsync(values)
      onSuccess(ticket)
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldKeys = Object.keys(err.fieldErrors) as Array<keyof RegisterFormValues>
        for (const field of fieldKeys) {
          if (field === 'fullName' || field === 'email' || field === 'mobile') {
            setError(field, { type: 'server', message: err.fieldErrors[field] })
          }
        }
      }
    }
  }

  const topError =
    mutation.error instanceof ApiClientError && Object.keys(mutation.error.fieldErrors).length === 0
      ? mutation.error.message
      : mutation.error && !(mutation.error instanceof ApiClientError)
        ? 'Could not complete registration. Please try again.'
        : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      {topError && (
        <div className="animate-toast-in">
          <Alert tone="error" title="Registration could not be completed">
            {topError}
          </Alert>
        </div>
      )}

      <FormField
        label="Full Name"
        htmlFor="fullName"
        required
        error={errors.fullName?.message}
      >
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Juan Dela Cruz"
          leftIcon={<User className="h-4 w-4" />}
          hasError={Boolean(errors.fullName)}
          {...register('fullName')}
        />
      </FormField>

      <FormField
        label="Email Address"
        htmlFor="email"
        hint="Used with your ticket code to look up your pass later."
        required
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. juan.delacruz@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          hasError={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Mobile Number (PH)"
        htmlFor="mobile"
        hint="11-digit Philippine mobile number starting with 09."
        required
        error={errors.mobile?.message}
      >
        <Input
          id="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09171234567"
          leftIcon={<Phone className="h-4 w-4" />}
          hasError={Boolean(errors.mobile)}
          {...register('mobile')}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isWaitlist ? 'Joining waitlist...' : 'Securing your spot...'}</span>
          </>
        ) : (
          <>
            <span>{isWaitlist ? 'Join Waitlist' : 'Confirm Registration'}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
