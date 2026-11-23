export type StaffRole = 'ORGANIZER' | 'DOOR_STAFF'

export interface StaffProfile {
  id: number
  name: string
  username: string
  role: StaffRole
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  staff: StaffProfile
}
