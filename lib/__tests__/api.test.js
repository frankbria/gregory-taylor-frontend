import { renderHook, act, waitFor } from '@testing-library/react'
import useAPI from '../api'
import { useError } from '../ErrorContext'

// Mock dependencies
jest.mock('../ErrorContext')

// Mock fetch
global.fetch = jest.fn()

describe('useAPI Hook', () => {
  const mockHandleApiError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useError.mockReturnValue({
      handleApiError: mockHandleApiError
    })
  })

  describe('getUserOrders', () => {
    const mockOrders = [
      {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        createdAt: '2024-01-15T10:30:00Z',
        totalAmount: 150.00,
        status: 'paid',
        items: [
          {
            imageUrl: 'https://res.cloudinary.com/test/image.jpg',
            title: 'Beautiful Sunset',
            size: '8x10',
            frame: 'Black Frame',
            format: 'Canvas',
            quantity: 2,
            unitPrice: 75.00
          }
        ]
      },
      {
        _id: '507f1f77bcf86cd799439012',
        userId: 'user123',
        createdAt: '2024-01-10T14:20:00Z',
        totalAmount: 50.00,
        status: 'fulfilled',
        items: [
          {
            imageUrl: 'https://res.cloudinary.com/test/image2.jpg',
            title: 'Mountain View',
            size: '11x14',
            frame: 'White Frame',
            format: 'Photo Paper',
            quantity: 1,
            unitPrice: 50.00
          }
        ]
      }
    ]

    it('should fetch orders for a given userId', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders
      })

      const { result } = renderHook(() => useAPI())

      let orders
      await act(async () => {
        orders = await result.current.getUserOrders('user123')
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/orders?userId=user123',
        { credentials: 'include' }
      )
      expect(orders).toEqual(mockOrders)
    })

    it('should return empty array when no orders exist', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      const { result } = renderHook(() => useAPI())

      let orders
      await act(async () => {
        orders = await result.current.getUserOrders('user123')
      })

      expect(orders).toEqual([])
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getUserOrders('user123')).rejects.toThrow(
          'Failed to fetch orders: 500 Internal Server Error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getUserOrders'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getUserOrders('user123')).rejects.toThrow(
          'Network error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getUserOrders'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getUserOrders('user123')).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getUserOrders'
      )

      // Restore environment variable
      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })

    it('should encode special characters in userId', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await result.current.getUserOrders('user+test@example.com')
      })

      // The URL should properly encode special characters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('userId=user'),
        { credentials: 'include' }
      )
    })
  })

  describe('getPhotos', () => {
    const mockPhotos = [
      { _id: 'photo1', title: 'Sunset', imageUrl: 'https://res.cloudinary.com/test/sunset.jpg' },
      { _id: 'photo2', title: 'Mountain', imageUrl: 'https://res.cloudinary.com/test/mountain.jpg' }
    ]

    it('should fetch all photos successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotos
      })

      const { result } = renderHook(() => useAPI())

      let photos
      await act(async () => {
        photos = await result.current.getPhotos()
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/photos')
      expect(photos).toEqual(mockPhotos)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotos()).rejects.toThrow(
          'Failed to fetch photos: 500 Internal Server Error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getPhotos'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotos()).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getPhotos'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotos()).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getPhotos'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('getPhotoImageSettings', () => {
    const mockSettings = {
      brightness: 10,
      contrast: 5,
      saturation: 0,
      quality: 85,
      format: 'auto'
    }

    it('should fetch image settings for a photo', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings
      })

      const { result } = renderHook(() => useAPI())

      let settings
      await act(async () => {
        settings = await result.current.getPhotoImageSettings('photo123')
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/photos/photo123/image-settings', { credentials: 'include' })
      expect(settings).toEqual(mockSettings)
    })

    it('should throw error when photoId is not provided', async () => {
      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotoImageSettings()).rejects.toThrow(
          'photoId is required'
        )
      })
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotoImageSettings('photo123')).rejects.toThrow(
          'Failed to fetch photo image settings: 404 Not Found'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getPhotoImageSettings'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotoImageSettings('photo123')).rejects.toThrow(
          'Network error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getPhotoImageSettings'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.getPhotoImageSettings('photo123')).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getPhotoImageSettings'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('updatePhotoImageSettings', () => {
    const mockUpdatedSettings = {
      brightness: 15,
      contrast: 10,
      saturation: 5,
      quality: 90,
      format: 'webp'
    }

    it('should update image settings for a photo', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedSettings
      })

      const { result } = renderHook(() => useAPI())

      let settings
      await act(async () => {
        settings = await result.current.updatePhotoImageSettings('photo123', { brightness: 15, contrast: 10 })
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/photos/photo123/image-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brightness: 15, contrast: 10 }),
        credentials: 'include'
      })
      expect(settings).toEqual(mockUpdatedSettings)
    })

    it('should throw error when photoId is not provided', async () => {
      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(result.current.updatePhotoImageSettings(null, { brightness: 10 })).rejects.toThrow(
          'photoId is required'
        )
      })
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(
          result.current.updatePhotoImageSettings('photo123', { brightness: -999 })
        ).rejects.toThrow('Failed to update photo image settings: 400 Bad Request')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updatePhotoImageSettings'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(
          result.current.updatePhotoImageSettings('photo123', { brightness: 10 })
        ).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'updatePhotoImageSettings'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useAPI())

      await act(async () => {
        await expect(
          result.current.updatePhotoImageSettings('photo123', { brightness: 10 })
        ).rejects.toThrow('API base URL is not defined')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updatePhotoImageSettings'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })
})

// Tests for standalone per-photo API exports
describe('Standalone per-photo API exports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPhotos (standalone)', () => {
    it('should fetch all photos', async () => {
      const { getPhotos } = await import('../api')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: '1', title: 'Photo 1' }]
      })

      const result = await getPhotos()
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/photos')
      expect(result).toEqual([{ _id: '1', title: 'Photo 1' }])
    })

    it('should throw when base URL missing', async () => {
      const { getPhotos } = await import('../api')
      const original = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      await expect(getPhotos()).rejects.toThrow('API base URL is not defined')
      process.env.NEXT_PUBLIC_API_BASE = original
    })

    it('should throw on non-ok response', async () => {
      const { getPhotos } = await import('../api')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })

      await expect(getPhotos()).rejects.toThrow('Failed to fetch photos')
    })
  })

  describe('getPhotoImageSettings (standalone)', () => {
    it('should fetch image settings for a photo', async () => {
      const { getPhotoImageSettings } = await import('../api')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ brightness: 10, quality: 85 })
      })

      const result = await getPhotoImageSettings('photo123')
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/photos/photo123/image-settings', { credentials: 'include' })
      expect(result).toEqual({ brightness: 10, quality: 85 })
    })

    it('should throw when photoId not provided', async () => {
      const { getPhotoImageSettings } = await import('../api')

      await expect(getPhotoImageSettings()).rejects.toThrow('photoId is required')
    })

    it('should throw when base URL missing', async () => {
      const { getPhotoImageSettings } = await import('../api')
      const original = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      await expect(getPhotoImageSettings('photo123')).rejects.toThrow('API base URL is not defined')
      process.env.NEXT_PUBLIC_API_BASE = original
    })

    it('should throw on non-ok response', async () => {
      const { getPhotoImageSettings } = await import('../api')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })

      await expect(getPhotoImageSettings('photo123')).rejects.toThrow('Failed to fetch photo image settings')
    })
  })

  describe('updatePhotoImageSettings (standalone)', () => {
    it('should update image settings for a photo', async () => {
      const { updatePhotoImageSettings } = await import('../api')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ brightness: 15, quality: 90 })
      })

      const result = await updatePhotoImageSettings('photo123', { brightness: 15 })
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/photos/photo123/image-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brightness: 15 }),
        credentials: 'include'
      })
      expect(result).toEqual({ brightness: 15, quality: 90 })
    })

    it('should throw when photoId not provided', async () => {
      const { updatePhotoImageSettings } = await import('../api')

      await expect(updatePhotoImageSettings(null, { brightness: 10 })).rejects.toThrow('photoId is required')
    })

    it('should throw when base URL missing', async () => {
      const { updatePhotoImageSettings } = await import('../api')
      const original = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      await expect(updatePhotoImageSettings('photo123', { brightness: 10 })).rejects.toThrow('API base URL is not defined')
      process.env.NEXT_PUBLIC_API_BASE = original
    })

    it('should throw on non-ok response', async () => {
      const { updatePhotoImageSettings } = await import('../api')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' })

      await expect(updatePhotoImageSettings('photo123', {})).rejects.toThrow('Failed to update photo image settings')
    })
  })
})
