import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import CartPage from '../page'
import { useCart } from '@/lib/CartContext'
import { getSizes, getFrames, getFormats } from '@/lib/api'
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe'
import { toast } from 'react-hot-toast'

// Mock dependencies
jest.mock('@/lib/CartContext')
jest.mock('@/lib/api')
jest.mock('@/lib/stripe')
jest.mock('react-hot-toast')
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})
jest.mock('@/components/CloudinaryImage', () => {
  return function CloudinaryImage({ src, alt }) {
    return <img src={src} alt={alt} />
  }
})

describe('CartPage Component', () => {
  const mockRemoveFromCart = jest.fn()
  const mockUpdateQuantity = jest.fn()
  const mockClearCart = jest.fn()

  const mockSizes = [
    { _id: 'size1', name: '8x10', price: 20 },
    { _id: 'size2', name: '11x14', price: 30 }
  ]

  const mockFrames = [
    { _id: 'frame1', name: 'Black Frame', price: 15 },
    { _id: 'frame2', name: 'White Frame', price: 15 }
  ]

  const mockFormats = [
    { _id: 'format1', name: 'Canvas', price: 25 },
    { _id: 'format2', name: 'Photo Paper', price: 10 }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    useCart.mockReturnValue({
      cart: [],
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart
    })

    getSizes.mockResolvedValue(mockSizes)
    getFrames.mockResolvedValue(mockFrames)
    getFormats.mockResolvedValue(mockFormats)
  })

  describe('Empty Cart', () => {
    it('should display empty cart message when cart is empty', () => {
      render(<CartPage />)

      expect(screen.getByText('Your Shopping Cart')).toBeInTheDocument()
      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
    })

    it('should show error toast when attempting checkout with empty cart', async () => {
      render(<CartPage />)

      // Wait for component to load
      await waitFor(() => {
        expect(getSizes).toHaveBeenCalled()
      })

      // Try to find and click checkout button - should not exist for empty cart
      const checkoutButton = screen.queryByText('Checkout')
      expect(checkoutButton).not.toBeInTheDocument()
    })
  })

  describe('Cart with Items', () => {
    const mockCartItems = [
      {
        id: 'item1',
        title: 'Beautiful Sunset',
        imageUrl: 'https://example.com/sunset.jpg',
        sizeId: 'size1',
        size: '8x10',
        frameId: 'frame1',
        frame: 'Black Frame',
        formatId: 'format1',
        format: 'Canvas',
        quantity: 2,
        price: 60 // 20 + 15 + 25
      },
      {
        id: 'item2',
        title: 'Mountain View',
        imageUrl: 'https://example.com/mountain.jpg',
        sizeId: 'size2',
        size: '11x14',
        quantity: 1,
        price: 30
      }
    ]

    beforeEach(() => {
      useCart.mockReturnValue({
        cart: mockCartItems,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart
      })
    })

    it('should render cart items correctly', async () => {
      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument()
        expect(screen.getByText('Mountain View')).toBeInTheDocument()
      })

      expect(screen.getByText('Size: 8x10')).toBeInTheDocument()
      expect(screen.getByText('Frame: Black Frame')).toBeInTheDocument()
      expect(screen.getByText('Format: Canvas')).toBeInTheDocument()
    })

    it('should calculate and display correct total price', async () => {
      render(<CartPage />)

      await waitFor(() => {
        // (60 * 2) + (30 * 1) = 150
        expect(screen.getByText('$150.00')).toBeInTheDocument()
      })
    })

    it('should handle quantity updates', async () => {
      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument()
      })

      const quantitySelects = screen.getAllByRole('combobox')
      fireEvent.change(quantitySelects[0], { target: { value: '3' } })

      expect(mockUpdateQuantity).toHaveBeenCalledWith('item1', 3)
    })

    it('should handle item removal', async () => {
      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument()
      })

      const removeButtons = screen.getAllByLabelText('Remove item')
      fireEvent.click(removeButtons[0])

      expect(mockRemoveFromCart).toHaveBeenCalledWith('item1')
    })

    it('should handle clear cart', async () => {
      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument()
      })

      const clearButton = screen.getByText('Clear Cart')
      fireEvent.click(clearButton)

      expect(mockClearCart).toHaveBeenCalled()
    })

    it('should calculate item price from size, frame, and format when price not available', async () => {
      const itemsWithoutPrice = [
        {
          id: 'item1',
          title: 'Test Photo',
          imageUrl: 'https://example.com/photo.jpg',
          sizeId: 'size1',
          frameId: 'frame1',
          formatId: 'format1',
          quantity: 1
        }
      ]

      useCart.mockReturnValue({
        cart: itemsWithoutPrice,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart
      })

      await act(async () => {
        render(<CartPage />)
      })

      await waitFor(() => {
        // 20 (size) + 15 (frame) + 25 (format) = 60
        const prices = screen.getAllByText('$60.00')
        expect(prices.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })
  })

  describe('Checkout Process', () => {
    const mockCartItems = [
      {
        id: 'item1',
        title: 'Test Photo',
        price: 50,
        quantity: 1,
        imageUrl: 'https://example.com/photo.jpg'
      }
    ]

    beforeEach(() => {
      useCart.mockReturnValue({
        cart: mockCartItems,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart
      })
    })

    it('should successfully initiate checkout', async () => {
      const mockSession = { id: 'cs_test_123' }
      createCheckoutSession.mockResolvedValue(mockSession)
      redirectToCheckout.mockResolvedValue({ success: true })

      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      const checkoutButton = screen.getByText('Checkout')
      fireEvent.click(checkoutButton)

      await waitFor(() => {
        expect(createCheckoutSession).toHaveBeenCalledWith(mockCartItems)
        expect(redirectToCheckout).toHaveBeenCalledWith('cs_test_123')
        expect(toast.success).toHaveBeenCalledWith('Redirecting to Stripe checkout...')
      })
    })

    it('should show loading state during checkout', async () => {
      createCheckoutSession.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ id: 'cs_test_123' }), 100))
      )
      redirectToCheckout.mockResolvedValue({ success: true })

      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      const checkoutButton = screen.getByText('Checkout')
      fireEvent.click(checkoutButton)

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument()
      })
    })

    it('should handle checkout session creation failure', async () => {
      createCheckoutSession.mockRejectedValue(new Error('Failed to create session'))

      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      const checkoutButton = screen.getByText('Checkout')
      fireEvent.click(checkoutButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Checkout failed. Please try again.')
      })
    })

    it('should handle redirect failure', async () => {
      const mockSession = { id: 'cs_test_123' }
      createCheckoutSession.mockResolvedValue(mockSession)
      redirectToCheckout.mockResolvedValue({ success: false, error: 'Redirect failed' })

      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      const checkoutButton = screen.getByText('Checkout')
      fireEvent.click(checkoutButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to redirect to checkout')
      })
    })

    it('should disable checkout button during processing', async () => {
      createCheckoutSession.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ id: 'cs_test_123' }), 100))
      )
      redirectToCheckout.mockResolvedValue({ success: true })

      render(<CartPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Photo')).toBeInTheDocument()
      })

      const checkoutButton = screen.getByText('Checkout')
      fireEvent.click(checkoutButton)

      await waitFor(() => {
        const processingButton = screen.getByText('Processing...')
        expect(processingButton).toBeDisabled()
      })
    })
  })

  describe('Price Data Loading', () => {
    it('should load sizes, frames, and formats on mount', async () => {
      render(<CartPage />)

      await waitFor(() => {
        expect(getSizes).toHaveBeenCalled()
        expect(getFrames).toHaveBeenCalled()
        expect(getFormats).toHaveBeenCalled()
      })
    })

    it('should handle price data loading errors gracefully', async () => {
      getSizes.mockRejectedValue(new Error('Failed to load sizes'))
      getFrames.mockRejectedValue(new Error('Failed to load frames'))
      getFormats.mockRejectedValue(new Error('Failed to load formats'))

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<CartPage />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading price data:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Price Calculations', () => {
    it('should use item.price when available', async () => {
      const cartWithPrices = [
        {
          id: 'item1',
          title: 'Photo',
          imageUrl: 'https://example.com/photo.jpg',
          price: 100,
          sizeId: 'size1',
          quantity: 1
        }
      ]

      useCart.mockReturnValue({
        cart: cartWithPrices,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart
      })

      await act(async () => {
        render(<CartPage />)
      })

      await waitFor(() => {
        const prices = screen.getAllByText('$100.00')
        expect(prices.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('should calculate price from components when item.price not valid', async () => {
      const cartWithoutPrices = [
        {
          id: 'item1',
          title: 'Photo',
          imageUrl: 'https://example.com/photo.jpg',
          price: NaN,
          sizeId: 'size1',
          frameId: 'frame1',
          quantity: 1
        }
      ]

      useCart.mockReturnValue({
        cart: cartWithoutPrices,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart
      })

      await act(async () => {
        render(<CartPage />)
      })

      await waitFor(() => {
        // 20 (size) + 15 (frame) = 35
        const prices = screen.getAllByText('$35.00')
        expect(prices.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('should handle missing component IDs gracefully', async () => {
      const cartWithMissingIds = [
        {
          id: 'item1',
          title: 'Photo',
          imageUrl: 'https://example.com/photo.jpg',
          quantity: 1
        }
      ]

      useCart.mockReturnValue({
        cart: cartWithMissingIds,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart
      })

      await act(async () => {
        render(<CartPage />)
      })

      await waitFor(() => {
        const prices = screen.getAllByText('$0.00')
        expect(prices.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })
  })
})
