import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { clearCheckInSession } from '../checkin/storage'
import { fetchStaffMe, loginStaff } from './api'
import { clearStoredToken, getStoredToken, setStoredToken } from './storage'
import type { LoginPayload, StaffProfile } from './types'

interface AuthContextValue {
  staff: StaffProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<StaffProfile>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [staff, setStaff] = useState<StaffProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()))

  useEffect(() => {
    const existingToken = getStoredToken()
    if (!existingToken) {
      setIsLoading(false)
      return
    }

    let active = true
    fetchStaffMe(existingToken)
      .then((profile) => {
        if (!active) return
        setToken(existingToken)
        setStaff(profile)
      })
      .catch(() => {
        if (!active) return
        clearStoredToken()
        setToken(null)
        setStaff(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload): Promise<StaffProfile> => {
    const res = await loginStaff(payload)
    setStoredToken(res.token)
    setToken(res.token)
    setStaff(res.staff)
    return res.staff
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    clearCheckInSession()
    setToken(null)
    setStaff(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        staff,
        token,
        isAuthenticated: Boolean(token && staff),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
