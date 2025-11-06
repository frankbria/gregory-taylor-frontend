import { NextResponse } from 'next/server'

// Create mock functions using jest.fn() factory
const mockCheckoutSessionsCreate = jest.fn()

// Mock Stripe before importing route
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkout: {
        sessions: {
          create: (...args) => mockCheckoutSessionsCreate(...args)
        }
      }
    }
  })
})

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ...data
    }))
  }
}))

// Mock fetch for backend order persistence
global.fetch = jest.fn()

// Now import the route
import { POST } from '../route'

describe('Checkout API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/checkout', () => {
    it('should create a checkout session with valid cart items', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const mockRequest = {
        json: async () => ({
          items: [
            {
              title: 'Test Photo 1',
              unitPrice: 50.00,
              quantity: 2
            },
            {
              title: 'Test Photo 2',
              unitPrice: 75.50,
              quantity: 1
            }
          ],
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Test Photo 1' },
              unit_amount: 5000
            },
            quantity: 2
          },
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Test Photo 2' },
              unit_amount: 7550
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/cart/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/cart/cancel',
        metadata: { userId: 'user123' }
      })

      expect(NextResponse.json).toHaveBeenCalledWith({ id: 'cs_test_123' })
    })

    it('should handle items without quantity (default to 1)', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const mockRequest = {
        json: async () => ({
          items: [
            {
              title: 'Test Photo',
              unitPrice: 50.00
            }
          ],
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      const createCall = mockCheckoutSessionsCreate.mock.calls[0][0]
      expect(createCall.line_items[0].quantity).toBe(1)
    })

    it('should handle empty userId', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const mockRequest = {
        json: async () => ({
          items: [{ title: 'Test Photo', unitPrice: 50, quantity: 1 }],
          userId: ''
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      const createCall = mockCheckoutSessionsCreate.mock.calls[0][0]
      expect(createCall.metadata.userId).toBe('')
    })

    it('should persist order to backend after creating session', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const mockItems = [
        { title: 'Photo 1', unitPrice: 50, quantity: 2 },
        { title: 'Photo 2', unitPrice: 75.5, quantity: 1 }
      ]

      const mockRequest = {
        json: async () => ({
          items: mockItems,
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeSessionId: 'cs_test_123',
          paymentIntentId: 'pi_test_456',
          items: mockItems,
          totalAmount: 175.5, // (50 * 2) + (75.5 * 1)
          currency: 'usd',
          userId: 'user123'
        })
      })
    })

    it('should correctly calculate total amount', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const mockItems = [
        { title: 'Photo 1', unitPrice: 25.50, quantity: 3 },
        { title: 'Photo 2', unitPrice: 100, quantity: 2 }
      ]

      const mockRequest = {
        json: async () => ({
          items: mockItems,
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      const fetchCall = fetch.mock.calls[0][1]
      const body = JSON.parse(fetchCall.body)
      expect(body.totalAmount).toBe(276.5) // (25.50 * 3) + (100 * 2)
    })

    it('should handle Stripe session creation errors', async () => {
      mockCheckoutSessionsCreate.mockRejectedValue(new Error('Stripe API error'))

      const mockRequest = {
        json: async () => ({
          items: [{ title: 'Test Photo', unitPrice: 50, quantity: 1 }],
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unable to create session' },
        { status: 500 }
      )
    })

    it('should handle backend order persistence failure gracefully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      // Backend fetch fails
      global.fetch.mockRejectedValueOnce(new Error('Backend error'))

      const mockRequest = {
        json: async () => ({
          items: [{ title: 'Test Photo', unitPrice: 50, quantity: 1 }],
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      // Should still return error because the try-catch catches all errors
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unable to create session' },
        { status: 500 }
      )
    })

    it('should convert prices to cents correctly (rounding)', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const mockRequest = {
        json: async () => ({
          items: [
            { title: 'Photo', unitPrice: 49.999, quantity: 1 } // Should round to 5000 cents
          ],
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? 'http://localhost:3000' : null
        }
      }

      await POST(mockRequest)

      const createCall = mockCheckoutSessionsCreate.mock.calls[0][0]
      expect(createCall.line_items[0].price_data.unit_amount).toBe(5000)
    })

    it('should use origin header for success/cancel URLs', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456'
      }

      mockCheckoutSessionsCreate.mockResolvedValue(mockSession)

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const customOrigin = 'https://example.com'
      const mockRequest = {
        json: async () => ({
          items: [{ title: 'Photo', unitPrice: 50, quantity: 1 }],
          userId: 'user123'
        }),
        headers: {
          get: (key) => key === 'origin' ? customOrigin : null
        }
      }

      await POST(mockRequest)

      const createCall = mockCheckoutSessionsCreate.mock.calls[0][0]
      expect(createCall.success_url).toBe(`${customOrigin}/cart/success?session_id={CHECKOUT_SESSION_ID}`)
      expect(createCall.cancel_url).toBe(`${customOrigin}/cart/cancel`)
    })
  })
})
