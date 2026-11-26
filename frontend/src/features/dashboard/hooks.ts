import { useQuery } from '@tanstack/react-query'
import { fetchDashboardMetrics } from './api'

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['staff-dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 10000, // automatic live sync every 10s
  })
}
