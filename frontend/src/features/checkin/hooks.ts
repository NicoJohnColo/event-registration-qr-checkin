import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth'
import { fetchCheckInStats, submitCheckIn } from './api'
import type { CheckInPayload, CheckInStats } from './types'

export function useCheckInStats(eventId: number | null) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['checkin-stats', eventId],
    queryFn: () => fetchCheckInStats(eventId as number, token as string),
    enabled: Boolean(eventId && token),
  })
}

export function useCheckIn() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CheckInPayload) => {
      if (!token) {
        return Promise.reject(new Error('Staff authentication required.'))
      }
      return submitCheckIn(payload, token)
    },
    onSuccess: (res, variables) => {
      queryClient.setQueryData<CheckInStats>(['checkin-stats', variables.eventId], (prev) =>
        prev
          ? {
              ...prev,
              checkedInCount: res.checkedInCount,
              registeredCount: res.registeredCount,
            }
          : prev,
      )
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
