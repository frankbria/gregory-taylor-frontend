import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'

// Mock dependencies
jest.mock('@/lib/CartContext', () => ({
  useCart: jest.fn(() => ({ cartCount: 0 })),
}))

jest.mock('@/lib/withInspector', () => (Component) => Component)

jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick, ...rest }) {
    return (
      <a href={href} onClick={onClick} {...rest}>
        {children}
      </a>
    )
  }
})

import { useCart } from '@/lib/CartContext'

describe('Header', () => {
  beforeEach(() => {
    useCart.mockReturnValue({ cartCount: 0 })
  })

  it('renders the site title', () => {
    render(<Header />)
    expect(screen.getByText('GREG TAYLOR PHOTOGRAPHY')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Header />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('My Orders')).toBeInTheDocument()
  })

  it('renders cart links with correct href', () => {
    render(<Header />)
    const cartLinks = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href') === '/cart'
    )
    expect(cartLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('displays the cart count from CartContext', () => {
    useCart.mockReturnValue({ cartCount: 5 })
    render(<Header />)

    const counts = screen.getAllByText('5')
    expect(counts.length).toBeGreaterThanOrEqual(1)
  })

  it('displays zero cart count', () => {
    useCart.mockReturnValue({ cartCount: 0 })
    render(<Header />)

    const counts = screen.getAllByText('0')
    expect(counts.length).toBeGreaterThanOrEqual(1)
  })

  describe('mobile menu', () => {
    it('renders hamburger button with aria-label', () => {
      render(<Header />)
      const button = screen.getByRole('button', { name: 'Toggle menu' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not show mobile nav links initially', () => {
      render(<Header />)
      // Mobile dropdown is conditionally rendered
      // Desktop links are always in the DOM (hidden via CSS)
      // But the mobile dropdown div should not exist
      expect(screen.queryByText('Gallery', { selector: '.px-6' })).not.toBeInTheDocument()
    })

    it('opens mobile menu when hamburger is clicked', () => {
      render(<Header />)
      const button = screen.getByRole('button', { name: 'Toggle menu' })

      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes mobile menu when a link is clicked', () => {
      render(<Header />)
      const button = screen.getByRole('button', { name: 'Toggle menu' })

      // Open menu
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')

      // Click a mobile menu link — find the one inside the dropdown
      const mobileLinks = screen.getAllByText('Gallery')
      const mobileLink = mobileLinks[mobileLinks.length - 1]
      fireEvent.click(mobileLink)

      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('toggles menu closed on second hamburger click', () => {
      render(<Header />)
      const button = screen.getByRole('button', { name: 'Toggle menu' })

      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
