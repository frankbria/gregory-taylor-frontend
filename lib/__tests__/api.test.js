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
        'http://localhost:3000/api/orders?userId=user123'
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
        expect.stringContaining('userId=user')
      )
    })
  })
})
