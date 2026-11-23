import { z } from 'zod'

export const ticketLookupSchema = z.object({
  ticketCode: z
    .string()
    .trim()
    .min(1, 'Ticket code is required.')
    .max(64, 'Ticket code must be 64 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(160, 'Email must be 160 characters or fewer.'),
})

export type TicketLookupFormValues = z.infer<typeof ticketLookupSchema>
