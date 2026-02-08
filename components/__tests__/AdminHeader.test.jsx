import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

const mockSignOut = jest.fn()
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@test.com' },
    signOut: mockSignOut,
  }),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('next/link', () => {
  const MockLink = ({ children, href }) => <a href={href}>{children}</a>
  MockLink.displayName = 'MockLink'
  return MockLink
})

import AdminHeader from '../AdminHeader'

describe('AdminHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders admin branding', () => {
    render(<AdminHeader />)

    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('shows user email', () => {
    render(<AdminHeader />)

    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('shows back to site link with correct href', () => {
    render(<AdminHeader />)

    const backLink = screen.getByText('Back to Site')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders Logout button', () => {
    render(<AdminHeader />)

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('calls signOut and redirects on logout', async () => {
    mockSignOut.mockResolvedValue()
    const user = userEvent.setup()
    render(<AdminHeader />)

    await user.click(screen.getByRole('button', { name: /logout/i }))

    expect(mockSignOut).toHaveBeenCalled()
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully')
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('shows error toast when logout fails', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<AdminHeader />)

    await user.click(screen.getByRole('button', { name: /logout/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Logout failed. Please try again.')
    })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
