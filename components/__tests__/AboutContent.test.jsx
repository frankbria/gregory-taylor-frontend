import { render, screen } from '@testing-library/react'

// Mock EditableContent to just render children (fallback behavior)
jest.mock('../EditableContent', () => {
  return function MockEditableContent({ children }) {
    return <>{children}</>
  }
})

import { AboutStory, AboutApproach } from '../AboutContent'

describe('AboutStory', () => {
  test('renders story content as fallback', () => {
    render(<AboutStory />)
    expect(screen.getByText(/National Geographic photographer/)).toBeInTheDocument()
    expect(screen.getByText(/Through that camera/)).toBeInTheDocument()
  })
})

describe('AboutApproach', () => {
  test('renders approach cards as fallback', () => {
    render(<AboutApproach />)
    expect(screen.getByText('Patience')).toBeInTheDocument()
    expect(screen.getByText('Perspective')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Connection')).toBeInTheDocument()
  })

  test('renders Southwest paragraph', () => {
    render(<AboutApproach />)
    expect(screen.getByText(/American Southwest/)).toBeInTheDocument()
  })
})
