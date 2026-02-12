import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CategoryGrid from '../CategoryGrid'
import { getCategories } from '@/lib/api'

// Mock dependencies
jest.mock('next/link', () => {
  return ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  )
})

jest.mock('@/lib/api')

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn()
  }
}))

// Track CloudinaryImage props for testing
let cloudinaryImageCalls = []

jest.mock('@/components/CloudinaryImage', () => {
  return function MockCloudinaryImage(props) {
    cloudinaryImageCalls.push(props)
    return (
      <div
        data-testid="cloudinary-image"
        data-src={props.src}
        data-alt={props.alt}
        data-aspect-ratio={props.aspectRatio}
        data-width={props.width}
        data-height={props.height}
      />
    )
  }
})

describe('CategoryGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    cloudinaryImageCalls = []
  })

  describe('Passing dimension props to CloudinaryImage', () => {
    it('should pass aspectRatio prop when category has aspectRatio', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'landscapes',
          name: 'Landscapes',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/landscapes.jpg',
          aspectRatio: 16/9
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('Landscapes')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.aspectRatio).toBe(16/9)
      })
    })

    it('should pass width and height props when category has dimensions', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'portraits',
          name: 'Portraits',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/portraits.jpg',
          width: 800,
          height: 1200
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('Portraits')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.width).toBe(800)
        expect(lastCall.height).toBe(1200)
      })
    })

    it('should work without dimension props (graceful degradation)', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'legacy',
          name: 'Legacy Category',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/legacy.jpg'
          // No dimension props
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('Legacy Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        // CloudinaryImage should still be called without dimension props
        // The component will use default 3:2 aspect ratio
        expect(lastCall.aspectRatio).toBeUndefined()
        expect(lastCall.width).toBeUndefined()
        expect(lastCall.height).toBeUndefined()
      })
    })

    it('should pass all dimension props together when all available', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'full-data',
          name: 'Full Data Category',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/full.jpg',
          aspectRatio: 4/3,
          width: 1200,
          height: 900
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('Full Data Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.aspectRatio).toBe(4/3)
        expect(lastCall.width).toBe(1200)
        expect(lastCall.height).toBe(900)
      })
    })
  })

  describe('Passing customSettings to CloudinaryImage', () => {
    it('should pass customSettings when category has imageSettings', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'landscapes',
          name: 'Landscapes',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/landscapes.jpg',
          imageSettings: { quality: 90, sharpen: 30 }
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('Landscapes')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.customSettings).toEqual({ quality: 90, sharpen: 30 })
      })
    })

    it('should not pass customSettings when category has no imageSettings', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'legacy',
          name: 'Legacy Category',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/legacy.jpg'
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('Legacy Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.customSettings).toBeUndefined()
      })
    })
  })

  describe('Category without featured image', () => {
    it('should show "No Image" placeholder when no displayUrl', async () => {
      const mockCategories = [
        {
          _id: '1',
          slug: 'no-image',
          name: 'No Image Category'
          // No displayUrl
        }
      ]

      getCategories.mockResolvedValue(mockCategories)

      render(<CategoryGrid />)

      await waitFor(() => {
        expect(screen.getByText('No Image Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('No Image')).toBeInTheDocument()
      })
    })
  })
})
