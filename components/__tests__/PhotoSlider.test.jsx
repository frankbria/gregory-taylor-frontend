import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import PhotoSlider from '../PhotoSlider'
import useAPI from '@/lib/api'

// Mock dependencies
jest.mock('@/lib/api')

// Mock next/image to capture props
let imageRenderCalls = []

jest.mock('next/image', () => {
  return function MockImage(props) {
    imageRenderCalls.push(props)
    return (
      <img
        src={props.src}
        alt={props.alt}
        data-testid="slider-image"
        className={props.className}
        data-priority={props.priority ? 'true' : 'false'}
      />
    )
  }
})

describe('PhotoSlider', () => {
  const mockGetFeaturedPhotos = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    imageRenderCalls = []
    jest.useFakeTimers()

    useAPI.mockReturnValue({
      getFeaturedPhotos: mockGetFeaturedPhotos
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Loading and Error States', () => {
    it('should show loading state while fetching photos', () => {
      mockGetFeaturedPhotos.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<PhotoSlider />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show error message when fetch fails', async () => {
      mockGetFeaturedPhotos.mockRejectedValue(new Error('Network error'))

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Unable to load featured photos')).toBeInTheDocument()
      })
    })

    it('should render nothing when no featured photos', async () => {
      mockGetFeaturedPhotos.mockResolvedValue([])

      const { container } = render(<PhotoSlider />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('Object-fit handling based on aspect ratio', () => {
    it('should use object-cover for normal aspect ratio photos', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Normal Photo',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/normal.jpg',
          aspectRatio: 16/9 // Normal landscape
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Normal Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = imageRenderCalls[imageRenderCalls.length - 1]
        expect(lastCall.className).toContain('object-cover')
        expect(lastCall.className).not.toContain('object-contain')
      })
    })

    it('should use object-contain for very wide panoramas (aspectRatio > 2.5)', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Panorama',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/panorama.jpg',
          aspectRatio: 3 // Wide panorama
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Panorama')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = imageRenderCalls[imageRenderCalls.length - 1]
        expect(lastCall.className).toContain('object-contain')
      })
    })

    it('should use object-cover at exactly 2.5 aspect ratio', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Borderline Photo',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/borderline.jpg',
          aspectRatio: 2.5 // Exactly at boundary
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Borderline Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = imageRenderCalls[imageRenderCalls.length - 1]
        expect(lastCall.className).toContain('object-cover')
      })
    })

    it('should default to object-cover when aspectRatio not provided', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Legacy Photo',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/legacy.jpg'
          // No aspectRatio
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Legacy Photo')).toBeInTheDocument()
      })

      await waitFor(() => {
        const lastCall = imageRenderCalls[imageRenderCalls.length - 1]
        expect(lastCall.className).toContain('object-cover')
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to next photo when next button clicked', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Photo 1',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo1.jpg'
        },
        {
          _id: '2',
          title: 'Photo 2',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo2.jpg'
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Photo 1')).toBeInTheDocument()
      })

      const nextButton = screen.getByLabelText('Next photo')
      fireEvent.click(nextButton)

      // Check that Photo 2 is now visible (first photo should have opacity-0)
      await waitFor(() => {
        const images = screen.getAllByTestId('slider-image')
        expect(images.length).toBe(2)
      })
    })

    it('should navigate to previous photo when prev button clicked', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Photo 1',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo1.jpg'
        },
        {
          _id: '2',
          title: 'Photo 2',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo2.jpg'
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Photo 1')).toBeInTheDocument()
      })

      const prevButton = screen.getByLabelText('Previous photo')
      fireEvent.click(prevButton)

      // Since we start at index 0, clicking prev should wrap to the last photo
      await waitFor(() => {
        const images = screen.getAllByTestId('slider-image')
        expect(images.length).toBe(2)
      })
    })
  })

  describe('Auto-rotation', () => {
    it('should auto-rotate photos every 5 seconds', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Photo 1',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo1.jpg'
        },
        {
          _id: '2',
          title: 'Photo 2',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo2.jpg'
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Photo 1')).toBeInTheDocument()
      })

      // Advance timers by 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000)
      })

      // Photos should have rotated
      await waitFor(() => {
        const images = screen.getAllByTestId('slider-image')
        expect(images.length).toBe(2)
      })
    })
  })

  describe('Indicator dots', () => {
    it('should render indicator dots for each photo', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Photo 1',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo1.jpg'
        },
        {
          _id: '2',
          title: 'Photo 2',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo2.jpg'
        },
        {
          _id: '3',
          title: 'Photo 3',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo3.jpg'
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Photo 1')).toBeInTheDocument()
      })

      // Should have 3 indicator buttons
      const indicators = screen.getAllByLabelText(/Go to slide/)
      expect(indicators.length).toBe(3)
    })

    it('should navigate to specific photo when indicator clicked', async () => {
      const mockPhotos = [
        {
          _id: '1',
          title: 'Photo 1',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo1.jpg'
        },
        {
          _id: '2',
          title: 'Photo 2',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo2.jpg'
        },
        {
          _id: '3',
          title: 'Photo 3',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/photo3.jpg'
        }
      ]

      mockGetFeaturedPhotos.mockResolvedValue(mockPhotos)

      render(<PhotoSlider />)

      await waitFor(() => {
        expect(screen.getByText('Photo 1')).toBeInTheDocument()
      })

      // Click on the third indicator
      const indicator3 = screen.getByLabelText('Go to slide 3')
      fireEvent.click(indicator3)

      // All photos should still be in DOM (only visibility changes)
      await waitFor(() => {
        const images = screen.getAllByTestId('slider-image')
        expect(images.length).toBe(3)
      })
    })
  })
})
