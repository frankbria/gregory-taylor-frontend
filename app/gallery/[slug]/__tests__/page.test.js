import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CategoryGalleryPage from '../page'
import { getPhotosByCategory } from '@/lib/api'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-category' })
}))

jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
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
        data-full-length={props.fullLength}
        data-aspect-ratio={props.aspectRatio}
        data-width={props.width}
        data-height={props.height}
      />
    )
  }
})

describe('CategoryGalleryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    cloudinaryImageCalls = []
  })

  describe('Passing dimension props to CloudinaryImage', () => {
    it('should pass aspectRatio prop when photo has aspectRatio', async () => {
      const mockPhotos = [
        {
          _id: '1',
          slug: 'photo-1',
          title: 'Test Photo',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
          aspectRatio: 16/9,
          fullLength: false
        }
      ]

      getPhotosByCategory.mockResolvedValue({
        category: { name: 'Test Category' },
        photos: mockPhotos
      })

      render(<CategoryGalleryPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const image = screen.getByTestId('cloudinary-image')
        expect(image).toHaveAttribute('data-aspect-ratio', String(16/9))
      })
    })

    it('should pass width and height props when photo has dimensions', async () => {
      const mockPhotos = [
        {
          _id: '1',
          slug: 'photo-1',
          title: 'Test Photo',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
          width: 1920,
          height: 1080,
          fullLength: false
        }
      ]

      getPhotosByCategory.mockResolvedValue({
        category: { name: 'Test Category' },
        photos: mockPhotos
      })

      render(<CategoryGalleryPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const image = screen.getByTestId('cloudinary-image')
        expect(image).toHaveAttribute('data-width', '1920')
        expect(image).toHaveAttribute('data-height', '1080')
      })
    })

    it('should pass fullLength prop for backward compatibility', async () => {
      const mockPhotos = [
        {
          _id: '1',
          slug: 'photo-1',
          title: 'Panorama',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/panorama.jpg',
          fullLength: true
        }
      ]

      getPhotosByCategory.mockResolvedValue({
        category: { name: 'Test Category' },
        photos: mockPhotos
      })

      render(<CategoryGalleryPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const image = screen.getByTestId('cloudinary-image')
        expect(image).toHaveAttribute('data-full-length', 'true')
      })
    })

    it('should work without dimension props (graceful degradation)', async () => {
      const mockPhotos = [
        {
          _id: '1',
          slug: 'photo-1',
          title: 'Legacy Photo',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/legacy.jpg'
          // No dimension props
        }
      ]

      getPhotosByCategory.mockResolvedValue({
        category: { name: 'Test Category' },
        photos: mockPhotos
      })

      render(<CategoryGalleryPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const image = screen.getByTestId('cloudinary-image')
        expect(image).toBeInTheDocument()
        // CloudinaryImage should still receive calls without dimension props
        // The component will use default 3:2 aspect ratio
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.aspectRatio).toBeUndefined()
        expect(lastCall.width).toBeUndefined()
        expect(lastCall.height).toBeUndefined()
      })
    })

    it('should pass all dimension props together when all available', async () => {
      const mockPhotos = [
        {
          _id: '1',
          slug: 'photo-1',
          title: 'Full Data Photo',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/full.jpg',
          aspectRatio: 4/3,
          width: 1600,
          height: 1200,
          fullLength: false
        }
      ]

      getPhotosByCategory.mockResolvedValue({
        category: { name: 'Test Category' },
        photos: mockPhotos
      })

      render(<CategoryGalleryPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument()
      })

      await waitFor(() => {
        const image = screen.getByTestId('cloudinary-image')
        expect(image).toHaveAttribute('data-aspect-ratio', String(4/3))
        expect(image).toHaveAttribute('data-width', '1600')
        expect(image).toHaveAttribute('data-height', '1200')
        expect(image).toHaveAttribute('data-full-length', 'false')
      })
    })
  })

  describe('Grid layout for wide images', () => {
    it('should add wide column span for panoramic images', async () => {
      const mockPhotos = [
        {
          _id: '1',
          slug: 'panorama-1',
          title: 'Wide Panorama',
          displayUrl: 'https://res.cloudinary.com/demo/image/upload/panorama.jpg',
          aspectRatio: 3, // > 2, should span multiple columns
          fullLength: true
        }
      ]

      getPhotosByCategory.mockResolvedValue({
        category: { name: 'Test Category' },
        photos: mockPhotos
      })

      render(<CategoryGalleryPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument()
      })

      // The link wrapper should have the md:col-span-3 class for wide images
      await waitFor(() => {
        const link = screen.getByRole('link')
        expect(link.className).toContain('md:col-span-3')
      })
    })
  })
})
