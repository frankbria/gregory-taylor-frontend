import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

const mockPush = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
  usePathname: () => mockPathname(),
}))

const mockUseAuth = jest.fn()
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/components/AdminHeader', () => {
  return function MockAdminHeader() {
    return <div data-testid="admin-header">Admin Header</div>
  }
})

jest.mock('@/components/admin/AdminNav', () => {
  return function MockAdminNav({ currentPath }) {
    return <nav data-testid="admin-nav" data-path={currentPath} />
  }
})

jest.mock('@/lib/ContentContext', () => ({
  ContentProvider: ({ children }) => <div data-testid="content-provider">{children}</div>,
}))

import AdminLayout from '../layout'

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/admin')
  })

  it('shows loading spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, isAuthenticated: false })

    render(<AdminLayout><div>child</div></AdminLayout>)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('child')).not.toBeInTheDocument()
  })

  it('renders children and AdminHeader when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true })

    render(<AdminLayout><div>Dashboard</div></AdminLayout>)

    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('redirects to /admin/login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false })

    render(<AdminLayout><div>Protected</div></AdminLayout>)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('does not redirect when on the login page', () => {
    mockPathname.mockReturnValue('/admin/login')
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false })

    render(<AdminLayout><div>Login Form</div></AdminLayout>)

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText('Login Form')).toBeInTheDocument()
  })

  it('does not redirect when loading', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, isAuthenticated: false })

    render(<AdminLayout><div>child</div></AdminLayout>)

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders AdminNav with current pathname when authenticated', () => {
    mockPathname.mockReturnValue('/admin/content')
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true })

    render(<AdminLayout><div>Content</div></AdminLayout>)

    const nav = screen.getByTestId('admin-nav')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('data-path', '/admin/content')
  })

  it('wraps content with ContentProvider when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true })

    render(<AdminLayout><div>Dashboard</div></AdminLayout>)

    expect(screen.getByTestId('content-provider')).toBeInTheDocument()
  })

  it('does not render AdminNav on login page', () => {
    mockPathname.mockReturnValue('/admin/login')
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false })

    render(<AdminLayout><div>Login Form</div></AdminLayout>)

    expect(screen.queryByTestId('admin-nav')).not.toBeInTheDocument()
  })
})
