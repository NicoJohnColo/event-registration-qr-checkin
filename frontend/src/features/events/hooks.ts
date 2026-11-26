import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  closeStaffEvent,
  createStaffEvent,
  getEvent,
  getEvents,
  getStaffEvents,
  updateStaffEvent,
} from './api'
import type { EventUpsertPayload } from './types'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })
}

export function useEvent(id: number | string | undefined) {
  return useQuery({
    queryKey: ['events', String(id)],
    queryFn: () => getEvent(id!),
    enabled: Boolean(id),
  })
}

export function useStaffEvents() {
  return useQuery({
    queryKey: ['staff-events'],
    queryFn: getStaffEvents,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EventUpsertPayload) => createStaffEvent(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-events'] })
      qc.invalidateQueries({ queryKey: ['staff-dashboard-metrics'] })
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EventUpsertPayload }) =>
      updateStaffEvent(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['staff-events'] })
      qc.invalidateQueries({ queryKey: ['staff-dashboard-metrics'] })
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['events', String(vars.id)] })
    },
  })
}

export function useCloseEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => closeStaffEvent(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['staff-events'] })
      qc.invalidateQueries({ queryKey: ['staff-dashboard-metrics'] })
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['events', String(id)] })
    },
  })
}
