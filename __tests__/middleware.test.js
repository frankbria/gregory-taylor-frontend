import { middleware, config } from '../middleware'
import { getSessionCookie } from 'better-auth/cookies'

jest.mock('better-auth/cookies', () => ({
  getSessionCookie: jest.fn(),
}))

// Mock NextResponse
const mockRedirect = jest.fn()
const mockNext = jest.fn()

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: (...args) => { mockRedirect(...args); return { type: 'redirect' } },
    next: (...args) => { mockNext(...args); return { type: 'next' } },
  },
}))

function createMockRequest(pathname) {
  return {
    nextUrl: {
      pathname,
    },
    url: `http://localhost:3000${pathname}`,
  }
}

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects unauthenticated users from /admin to /admin/login', () => {
    getSessionCookie.mockReturnValue(null)
    const request = createMockRequest('/admin')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/admin/login', 'http://localhost:3000/admin'))
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated users from /admin/settings to /admin/login', () => {
    getSessionCookie.mockReturnValue(null)
    const request = createMockRequest('/admin/settings')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/admin/login', 'http://localhost:3000/admin/settings'))
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('allows authenticated users to access /admin', () => {
    getSessionCookie.mockReturnValue('session-token')
    const request = createMockRequest('/admin')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows unauthenticated users to access /admin/login', () => {
    getSessionCookie.mockReturnValue(null)
    const request = createMockRequest('/admin/login')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects authenticated users from /admin/login to /admin', () => {
    getSessionCookie.mockReturnValue('session-token')
    const request = createMockRequest('/admin/login')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/admin', 'http://localhost:3000/admin/login'))
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('allows non-admin routes to pass through', () => {
    getSessionCookie.mockReturnValue(null)
    const request = createMockRequest('/')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('has correct config matcher for admin routes', () => {
    expect(config.matcher).toContain('/admin/:path*')
  })
})
