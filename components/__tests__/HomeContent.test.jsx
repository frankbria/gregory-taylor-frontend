import { render, screen, waitFor } from '@testing-library/react'

// Mock EditableContent to just render children (fallback behavior)
jest.mock('../EditableContent', () => {
  return function MockEditableContent({ children }) {
    return <>{children}</>
  }
})

import HomeContent from '../HomeContent'

describe('HomeContent', () => {
  test('renders hero text as fallback', () => {
    render(<HomeContent />)
    expect(screen.getByText('Gregory Taylor Photography')).toBeInTheDocument()
    expect(screen.getByText(/Welcome to my photography portfolio/)).toBeInTheDocument()
  })

  test('renders About My Work section', () => {
    render(<HomeContent />)
    expect(screen.getByText('About My Work')).toBeInTheDocument()
    expect(screen.getByText(/My photography explores/)).toBeInTheDocument()
  })

  test('renders Available Prints section', () => {
    render(<HomeContent />)
    expect(screen.getByText('Available Prints')).toBeInTheDocument()
    expect(screen.getByText(/All photographs on this site/)).toBeInTheDocument()
  })
})
