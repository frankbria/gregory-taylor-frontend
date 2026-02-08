import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

const mockUseAuth = jest.fn()
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseContent = jest.fn()
jest.mock('@/lib/ContentContext', () => ({
  useContent: () => mockUseContent(),
}))

import AdminDashboard from '../page'

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { email: 'admin@test.com' } })
    mockUseContent.mockReturnValue({
      pages: [
        { _id: '1', title: 'Home', updatedAt: '2025-01-15T10:00:00Z' },
        { _id: '2', title: 'About', updatedAt: '2025-01-10T10:00:00Z' },
      ],
      loading: false,
      refreshPages: jest.fn(),
    })
  })

  it('renders the Admin Dashboard heading', () => {
    render(<AdminDashboard />)

    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument()
  })

  it('shows welcome message with user email', () => {
    render(<AdminDashboard />)

    expect(screen.getByText(/welcome.*admin@test\.com/i)).toBeInTheDocument()
  })

  it('renders Content Editor navigation card with link to /admin/content', () => {
    render(<AdminDashboard />)

    const link = screen.getByRole('link', { name: /content editor/i })
    expect(link).toHaveAttribute('href', '/admin/content')
  })

  it('renders Image Settings navigation card with link to /admin/images', () => {
    render(<AdminDashboard />)

    const link = screen.getByRole('link', { name: /image settings/i })
    expect(link).toHaveAttribute('href', '/admin/images')
  })

  it('renders Layout Configuration navigation card with link to /admin/layout-settings', () => {
    render(<AdminDashboard />)

    const link = screen.getByRole('link', { name: /layout configuration/i })
    expect(link).toHaveAttribute('href', '/admin/layout-settings')
  })

  it('displays total pages count', () => {
    render(<AdminDashboard />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/total pages/i)).toBeInTheDocument()
  })

  it('shows loading state while content is loading', () => {
    mockUseContent.mockReturnValue({
      pages: [],
      loading: true,
      refreshPages: jest.fn(),
    })

    render(<AdminDashboard />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('calls refreshPages on mount', () => {
    const mockRefresh = jest.fn()
    mockUseContent.mockReturnValue({
      pages: [],
      loading: false,
      refreshPages: mockRefresh,
    })

    render(<AdminDashboard />)

    expect(mockRefresh).toHaveBeenCalled()
  })
})
