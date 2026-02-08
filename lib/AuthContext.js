'use client'

import { createContext, useContext, useCallback } from 'react'
import { authClient } from '@/lib/auth-client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { data: session, isPending, error } = authClient.useSession()

  const signOut = useCallback(async () => {
    await authClient.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        isLoading: isPending,
        isAuthenticated: !!session?.user,
        error,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
