import { useQuery } from '@tanstack/react-query'
import { fetchAuditLogs } from './api'

export function useAuditLogs(limit = 200) {
  return useQuery({
    queryKey: ['staff', 'audit-logs', limit],
    queryFn: () => fetchAuditLogs(limit),
    staleTime: 10_000,
  })
}
