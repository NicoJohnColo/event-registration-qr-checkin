import { z } from 'zod'

/** Single-source validation schema matching backend RegisterRequest constraints. */
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .max(120, 'Full name must be 120 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.'),
  mobile: z
    .string()
    .trim()
    .min(1, 'Mobile number is required.')
    .regex(
      /^09\d{9}$/,
      'Enter an 11-digit PH mobile number starting with 09 (e.g. 09171234567).',
    ),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
