import { render, screen, renderHook, act } from '@testing-library/react'

// Mock dependencies BEFORE importing
// Note: jest.mock is hoisted, so we cannot reference outer `const` variables
// directly in the factory. Use jest.fn() inline and retrieve via the mock module.
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: jest.fn(),
    signOut: jest.fn(),
  },
}))

// Import mock module to configure per-test return values
import { authClient } from '@/lib/auth-client'
import { AuthProvider, useAuth } from '../AuthContext'

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children', () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: null })
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: null })
    render(
      <AuthProvider>
        <div>First Child</div>
        <div>Second Child</div>
      </AuthProvider>
    )
    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
  })
})

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns session data when authenticated', () => {
    const mockSession = { user: { email: 'admin@test.com', name: 'Admin' } }
    authClient.useSession.mockReturnValue({ data: mockSession, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.session).toEqual(mockSession)
    expect(result.current.user).toEqual(mockSession.user)
    expect(result.current.user.email).toBe('admin@test.com')
    expect(result.current.user.name).toBe('Admin')
  })

  it('returns null user when not authenticated', () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('returns null user when session has no user', () => {
    authClient.useSession.mockReturnValue({ data: {}, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.user).toBeNull()
  })

  it('isLoading is true when isPending is true', () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: true, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('isLoading is false when isPending is false', () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('isAuthenticated is true when user exists', () => {
    const mockSession = { user: { email: 'admin@test.com', name: 'Admin' } }
    authClient.useSession.mockReturnValue({ data: mockSession, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('isAuthenticated is false when no user', () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is false when session exists but user is missing', () => {
    authClient.useSession.mockReturnValue({ data: {}, isPending: false, error: null })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('passes error from session hook', () => {
    const mockError = new Error('Session error')
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: mockError })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.error).toBe(mockError)
  })

  it('signOut calls authClient.signOut', async () => {
    authClient.useSession.mockReturnValue({ data: null, isPending: false, error: null })
    authClient.signOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(authClient.signOut).toHaveBeenCalledTimes(1)
  })

  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    )

    consoleSpy.mockRestore()
  })
})
