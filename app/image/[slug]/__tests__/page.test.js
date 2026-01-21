import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ImageDetailPage from '../page'
import { getPhotoBySlug, getSizes, getFrames, getFormats } from '@/lib/api'
import { useCart } from '@/lib/CartContext'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-photo' }),
  useRouter: () => ({
    push: jest.fn()
  })
}))

jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('@/lib/api')
jest.mock('@/lib/CartContext')

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

jest.mock('@/components/RoomPreviews', () => ({
  RoomPreviews: () => <div data-testid="room-previews">Room Previews</div>
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

const mockSizes = [
  { _id: 'size1', width: 8, height: 10, price: 50 }
]

const mockFrames = [
  { _id: 'frame1', style: 'Black Frame', price: 20 }
]

const mockFormats = [
  { _id: 'format1', name: 'Canvas', price: 30 }
]

describe('ImageDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    cloudinaryImageCalls = []

    useCart.mockReturnValue({
      addToCart: jest.fn()
    })

    getSizes.mockResolvedValue(mockSizes)
    getFrames.mockResolvedValue(mockFrames)
    getFormats.mockResolvedValue(mockFormats)
  })

  describe('Passing dimension props to CloudinaryImage', () => {
    it('should pass aspectRatio prop when photo has aspectRatio', async () => {
      const mockPhoto = {
        _id: '1',
        slug: 'test-photo',
        title: 'Test Photo',
        description: 'Test description',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        aspectRatio: 16/9,
        fullLength: false
      }

      getPhotoBySlug.mockResolvedValue(mockPhoto)

      render(<ImageDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.aspectRatio).toBe(16/9)
      })
    })

    it('should pass width and height props when photo has dimensions', async () => {
      const mockPhoto = {
        _id: '1',
        slug: 'test-photo',
        title: 'Test Photo',
        description: 'Test description',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        width: 1920,
        height: 1080,
        fullLength: false
      }

      getPhotoBySlug.mockResolvedValue(mockPhoto)

      render(<ImageDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.width).toBe(1920)
        expect(lastCall.height).toBe(1080)
      })
    })

    it('should pass fullLength prop for backward compatibility', async () => {
      const mockPhoto = {
        _id: '1',
        slug: 'panorama',
        title: 'Panorama Photo',
        description: 'A wide panorama',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/panorama.jpg',
        fullLength: true
      }

      getPhotoBySlug.mockResolvedValue(mockPhoto)

      render(<ImageDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Panorama Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.fullLength).toBe(true)
      })
    })

    it('should work without dimension props (graceful degradation)', async () => {
      const mockPhoto = {
        _id: '1',
        slug: 'legacy-photo',
        title: 'Legacy Photo',
        description: 'An old photo without dimension data',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/legacy.jpg'
        // No dimension props
      }

      getPhotoBySlug.mockResolvedValue(mockPhoto)

      render(<ImageDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Legacy Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.aspectRatio).toBeUndefined()
        expect(lastCall.width).toBeUndefined()
        expect(lastCall.height).toBeUndefined()
      })
    })

    it('should pass all dimension props together when all available', async () => {
      const mockPhoto = {
        _id: '1',
        slug: 'full-data',
        title: 'Full Data Photo',
        description: 'Photo with all dimension data',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/full.jpg',
        aspectRatio: 4/3,
        width: 1600,
        height: 1200,
        fullLength: false
      }

      getPhotoBySlug.mockResolvedValue(mockPhoto)

      render(<ImageDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Full Data Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = cloudinaryImageCalls[cloudinaryImageCalls.length - 1]
        expect(lastCall.aspectRatio).toBe(4/3)
        expect(lastCall.width).toBe(1600)
        expect(lastCall.height).toBe(1200)
        expect(lastCall.fullLength).toBe(false)
      })
    })
  })
})
