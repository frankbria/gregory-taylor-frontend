import { render, screen } from '@testing-library/react'

// Mock child components
jest.mock('@/components/PhotoSlider', () => {
  return function MockPhotoSlider() {
    return <div data-testid="photo-slider">PhotoSlider</div>
  }
})

jest.mock('@/components/HomeContent', () => {
  return function MockHomeContent() {
    return <div data-testid="home-content">HomeContent</div>
  }
})

import Home from '../page'

describe('Home Page', () => {
  test('renders PhotoSlider', () => {
    render(<Home />)
    expect(screen.getByTestId('photo-slider')).toBeInTheDocument()
  })

  test('renders HomeContent component', () => {
    render(<Home />)
    expect(screen.getByTestId('home-content')).toBeInTheDocument()
  })

  test('renders View Gallery link', () => {
    render(<Home />)
    const link = screen.getByText('View Gallery')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/gallery')
  })
})
