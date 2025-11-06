// Mock @stripe/stripe-js BEFORE importing
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn()
}))

import { createCheckoutSession, redirectToCheckout } from '../stripe'
import { loadStripe } from '@stripe/stripe-js'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage properly
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

describe('Stripe Payment Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    // Set default return value for localStorage.getItem
    localStorageMock.getItem.mockImplementation(() => '')
  })

  describe('createCheckoutSession', () => {
    it('should successfully create a checkout session with cart items', async () => {
      const mockCartItems = [
        {
          id: '1',
          title: 'Test Photo 1',
          price: 50.00,
          unitPrice: 50.00,
          quantity: 2
        },
        {
          id: '2',
          title: 'Test Photo 2',
          unitPrice: 75.50,
          quantity: 1
        }
      ]

      const mockSession = { id: 'cs_test_123' }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      })

      const result = await createCheckoutSession(mockCartItems)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: '1',
              title: 'Test Photo 1',
              price: 50.00,
              unitPrice: 50.00,
              quantity: 2
            },
            {
              id: '2',
              title: 'Test Photo 2',
              unitPrice: 75.50,
              quantity: 1
            }
          ],
          userId: ''
        })
      })

      expect(result).toEqual(mockSession)
    })

    it('should include userId from localStorage in request body', async () => {
      const mockCartItems = [
        { id: '1', title: 'Test Photo', unitPrice: 50, quantity: 1 }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'cs_test_123' })
      })

      await createCheckoutSession(mockCartItems)

      // Verify the request includes userId in the body
      const fetchCall = fetch.mock.calls[0]
      expect(fetchCall[0]).toBe('http://localhost:3000/api/checkout')
      const body = JSON.parse(fetchCall[1].body)
      // userId should be present (will be empty string in this test)
      expect(body).toHaveProperty('userId')
      expect(typeof body.userId).toBe('string')
    })

    it('should normalize price to unitPrice for each item', async () => {
      const mockCartItems = [
        { id: '1', title: 'Photo', price: 100, quantity: 1 }
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'cs_test_123' })
      })

      await createCheckoutSession(mockCartItems)

      const fetchCall = fetch.mock.calls[0][1]
      const body = JSON.parse(fetchCall.body)

      expect(body.items[0].unitPrice).toBe(100)
    })

    it('should throw error when API response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const mockCartItems = [
        { id: '1', title: 'Test Photo', unitPrice: 50, quantity: 1 }
      ]

      await expect(createCheckoutSession(mockCartItems)).rejects.toThrow(
        'Failed to create checkout session'
      )
    })

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const mockCartItems = [
        { id: '1', title: 'Test Photo', unitPrice: 50, quantity: 1 }
      ]

      await expect(createCheckoutSession(mockCartItems)).rejects.toThrow('Network error')
    })
  })

  describe('redirectToCheckout', () => {
    it('should return error when stripe fails to initialize', async () => {
      // stripePromise was created at module load with the mocked loadStripe
      // which defaults to returning undefined/null
      const sessionId = 'cs_test_123'
      const result = await redirectToCheckout(sessionId)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe('Stripe failed to initialize')
    })
  })
})
