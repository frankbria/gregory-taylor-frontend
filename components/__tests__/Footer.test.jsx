import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

jest.mock('@/lib/withInspector', () => (Component) => Component)

jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height }) {
    return <img src={src} alt={alt} width={width} height={height} />
  }
})

describe('Footer', () => {
  it('renders the photographer photo', () => {
    render(<Footer />)
    const img = screen.getByAltText('Greg Taylor')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/Greg-600x600.jpg')
  })

  it('renders all three social media links', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    const socialLinks = links.filter((link) => {
      const href = link.getAttribute('href')
      return href?.includes('facebook.com') ||
        href?.includes('instagram.com') ||
        href?.includes('linkedin.com')
    })

    expect(socialLinks).toHaveLength(3)
  })

  it('renders Facebook link with correct URL', () => {
    render(<Footer />)
    const fbLink = screen.getAllByRole('link').find(
      (link) => link.getAttribute('href')?.includes('facebook.com')
    )
    expect(fbLink).toHaveAttribute('target', '_blank')
    expect(fbLink).toHaveAttribute('rel', 'noreferrer')
  })

  it('renders Instagram link with correct URL', () => {
    render(<Footer />)
    const igLink = screen.getAllByRole('link').find(
      (link) => link.getAttribute('href')?.includes('instagram.com')
    )
    expect(igLink).toHaveAttribute('target', '_blank')
  })

  it('renders LinkedIn link with correct URL', () => {
    render(<Footer />)
    const liLink = screen.getAllByRole('link').find(
      (link) => link.getAttribute('href')?.includes('linkedin.com')
    )
    expect(liLink).toHaveAttribute('target', '_blank')
  })

  it('renders the contact link', () => {
    render(<Footer />)
    const contactLink = screen.getByText('Contact Greg Taylor')
    expect(contactLink).toBeInTheDocument()
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact')
  })

  it('renders the bio section', () => {
    render(<Footer />)
    expect(screen.getByText(/fine art landscape photographer/)).toBeInTheDocument()
    expect(screen.getByText(/deserts of the Southwest/)).toBeInTheDocument()
  })

  it('renders Follow and Contact section headers', () => {
    render(<Footer />)
    expect(screen.getByText('Follow')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})
