import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

import AdminNav from '../AdminNav'

describe('AdminNav', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a nav element', () => {
    render(<AdminNav currentPath="/admin" />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders Dashboard link pointing to /admin', () => {
    render(<AdminNav currentPath="/admin" />)

    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/admin')
  })

  it('renders Content link pointing to /admin/content', () => {
    render(<AdminNav currentPath="/admin" />)

    const link = screen.getByRole('link', { name: /content/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/admin/content')
  })

  it('renders Images link pointing to /admin/images', () => {
    render(<AdminNav currentPath="/admin" />)

    const link = screen.getByRole('link', { name: /images/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/admin/images')
  })

  it('renders Layout link pointing to /admin/layout-settings', () => {
    render(<AdminNav currentPath="/admin" />)

    const link = screen.getByRole('link', { name: /layout/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/admin/layout-settings')
  })

  it('highlights the active link matching currentPath', () => {
    render(<AdminNav currentPath="/admin/content" />)

    const contentLink = screen.getByRole('link', { name: /content/i })
    expect(contentLink).toHaveClass('bg-gray-700')

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).not.toHaveClass('bg-gray-700')
  })

  it('highlights Dashboard when currentPath is /admin', () => {
    render(<AdminNav currentPath="/admin" />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveClass('bg-gray-700')
  })

  it('renders all four navigation items', () => {
    render(<AdminNav currentPath="/admin" />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
  })
})
