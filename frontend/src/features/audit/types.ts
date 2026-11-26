export interface AuditLogEntry {
  id: number
  action: string
  entityType: string
  entityId: number
  performedById: number | null
  performedByName: string
  performedByRole: 'ORGANIZER' | 'DOOR_STAFF' | 'ATTENDEE' | string
  details: string
  createdAt: string
}
