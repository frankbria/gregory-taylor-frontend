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

const mockSignIn = jest.fn()
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: (...args) => mockSignIn(...args),
    },
    useSession: jest.fn(),
  },
}))

const mockUseAuth = jest.fn()
jest.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import AdminLoginPage from '../page'

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('renders login form with email and password fields, branding, and sign in button', () => {
    render(<AdminLoginPage />)

    expect(screen.getByText('GREG TAYLOR PHOTOGRAPHY')).toBeInTheDocument()
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email *')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows "Email is required" when submitting with empty email', async () => {
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('shows "Invalid email address" for invalid email format', async () => {
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    // Use a value that passes HTML email validation but fails the stricter regex pattern
    // The input type="email" in jsdom allows some values the regex rejects
    const emailInput = screen.getByPlaceholderText('Email *')
    await user.type(emailInput, 'user@incomplete')
    await user.type(screen.getByPlaceholderText('Password *'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('shows "Password is required" when submitting with empty password', async () => {
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.type(screen.getByPlaceholderText('Email *'), 'admin@test.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('shows "Password must be at least 8 characters" for short passwords', async () => {
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.type(screen.getByPlaceholderText('Email *'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('Password *'), 'short')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('redirects to /admin on successful login', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.type(screen.getByPlaceholderText('Email *'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('Password *'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123',
      })
      expect(toast.success).toHaveBeenCalledWith('Welcome back!')
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('shows error toast on failed login with invalid credentials', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.type(screen.getByPlaceholderText('Email *'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('Password *'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password')
    })
  })

  it('shows rate limiting error when too many attempts', async () => {
    mockSignIn.mockResolvedValue({ error: { status: 429, message: 'rate limited' } })
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.type(screen.getByPlaceholderText('Email *'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('Password *'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Too many login attempts. Please try again later.')
    })
  })

  it('shows error toast on network error', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<AdminLoginPage />)

    await user.type(screen.getByPlaceholderText('Email *'), 'admin@test.com')
    await user.type(screen.getByPlaceholderText('Password *'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password')
    })
  })

  it('redirects to /admin when already authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(<AdminLoginPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    const { container } = render(<AdminLoginPage />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Email *')).not.toBeInTheDocument()
  })
})
