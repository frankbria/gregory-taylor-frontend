import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import OrdersPage from '../page'
import useAPI from '@/lib/api'

// Mock dependencies
jest.mock('@/lib/api')
jest.mock('next/link', () => {
  const MockLink = ({ children, href }) => <a href={href}>{children}</a>
  MockLink.displayName = 'MockLink'
  return MockLink
})
jest.mock('@/components/CloudinaryImage', () => {
  const MockCloudinaryImage = function(props) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} data-testid="cloudinary-image" />
  }
  MockCloudinaryImage.displayName = 'MockCloudinaryImage'
  return MockCloudinaryImage
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.print
const printMock = jest.fn()
Object.defineProperty(window, 'print', { value: printMock })

describe('OrdersPage Component', () => {
  const mockGetUserOrders = jest.fn()

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

  beforeEach(() => {
    jest.clearAllMocks()
    useAPI.mockReturnValue({
      getUserOrders: mockGetUserOrders
    })
  })

  describe('Loading State', () => {
    it('should display loading state initially', () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<OrdersPage />)

      expect(screen.getByText('Loading orders...')).toBeInTheDocument()
    })
  })

  describe('No userId in localStorage', () => {
    it('should display empty state when no userId exists', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('My Orders')).toBeInTheDocument()
        expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument()
      })

      expect(screen.getByText('Browse Gallery')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Browse Gallery' })).toHaveAttribute('href', '/gallery')
    })
  })

  describe('Empty Orders', () => {
    it('should display empty state when user has no orders', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([])

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('My Orders')).toBeInTheDocument()
        expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument()
      })

      expect(mockGetUserOrders).toHaveBeenCalledWith('user123')
    })
  })

  describe('Orders Display', () => {
    it('should render orders correctly', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue(mockOrders)

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('My Orders')).toBeInTheDocument()
      })

      // Check first order
      expect(screen.getByText('Beautiful Sunset')).toBeInTheDocument()
      expect(screen.getByText('$150.00')).toBeInTheDocument()
      expect(screen.getByText('paid')).toBeInTheDocument()

      // Check second order
      expect(screen.getByText('Mountain View')).toBeInTheDocument()
      expect(screen.getByText('$50.00')).toBeInTheDocument()
      expect(screen.getByText('fulfilled')).toBeInTheDocument()
    })

    it('should display order ID (last 8 characters)', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue(mockOrders)

      render(<OrdersPage />)

      await waitFor(() => {
        // Last 8 chars of '507f1f77bcf86cd799439011' is '99439011'
        expect(screen.getByText(/99439011/)).toBeInTheDocument()
        // Last 8 chars of '507f1f77bcf86cd799439012' is '99439012'
        expect(screen.getByText(/99439012/)).toBeInTheDocument()
      })
    })

    it('should display formatted dates', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue(mockOrders)

      render(<OrdersPage />)

      await waitFor(() => {
        // The date format depends on locale but should be present
        expect(screen.getByText(/1\/15\/2024|15\/1\/2024|Jan/)).toBeInTheDocument()
      })
    })

    it('should display item details correctly', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue(mockOrders)

      render(<OrdersPage />)

      await waitFor(() => {
        // Item details: size, frame, format separated by bullets
        expect(screen.getByText(/8x10/)).toBeInTheDocument()
        expect(screen.getByText(/Black Frame/)).toBeInTheDocument()
        expect(screen.getByText(/Canvas/)).toBeInTheDocument()
        expect(screen.getByText(/Qty: 2/)).toBeInTheDocument()
        expect(screen.getByText(/\$75\.00/)).toBeInTheDocument()
      })
    })

    it('should render CloudinaryImage for each item', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue(mockOrders)

      render(<OrdersPage />)

      await waitFor(() => {
        const images = screen.getAllByTestId('cloudinary-image')
        expect(images).toHaveLength(2)
      })
    })
  })

  describe('Status Badges', () => {
    it('should display green badge for fulfilled status', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([mockOrders[1]]) // fulfilled order

      render(<OrdersPage />)

      await waitFor(() => {
        const badge = screen.getByText('fulfilled')
        expect(badge).toHaveClass('bg-green-100', 'text-green-800')
      })
    })

    it('should display blue badge for paid status', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([mockOrders[0]]) // paid order

      render(<OrdersPage />)

      await waitFor(() => {
        const badge = screen.getByText('paid')
        expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
      })
    })

    it('should display gray badge for other statuses', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([{
        ...mockOrders[0],
        status: 'pending'
      }])

      render(<OrdersPage />)

      await waitFor(() => {
        const badge = screen.getByText('pending')
        expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
      })
    })
  })

  describe('Print Receipt', () => {
    it('should show Print Receipt button for fulfilled orders', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([mockOrders[1]]) // fulfilled order

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Print Receipt')).toBeInTheDocument()
      })
    })

    it('should not show Print Receipt button for non-fulfilled orders', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([mockOrders[0]]) // paid order

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('paid')).toBeInTheDocument()
      })

      expect(screen.queryByText('Print Receipt')).not.toBeInTheDocument()
    })

    it('should call window.print when Print Receipt is clicked', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([mockOrders[1]]) // fulfilled order

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Print Receipt')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Print Receipt'))

      expect(printMock).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockRejectedValue(new Error('API error'))

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<OrdersPage />)

      await waitFor(() => {
        // Should show empty state on error
        expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Multiple Items Per Order', () => {
    it('should display all items in an order', async () => {
      const orderWithMultipleItems = {
        _id: '507f1f77bcf86cd799439099',
        userId: 'user123',
        createdAt: '2024-01-20T10:00:00Z',
        totalAmount: 200.00,
        status: 'paid',
        items: [
          {
            imageUrl: 'https://res.cloudinary.com/test/image1.jpg',
            title: 'Photo One',
            size: '8x10',
            frame: 'Black',
            format: 'Canvas',
            quantity: 1,
            unitPrice: 100.00
          },
          {
            imageUrl: 'https://res.cloudinary.com/test/image2.jpg',
            title: 'Photo Two',
            size: '11x14',
            frame: 'White',
            format: 'Paper',
            quantity: 2,
            unitPrice: 50.00
          }
        ]
      }

      localStorageMock.getItem.mockReturnValue('user123')
      mockGetUserOrders.mockResolvedValue([orderWithMultipleItems])

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Photo One')).toBeInTheDocument()
        expect(screen.getByText('Photo Two')).toBeInTheDocument()
      })

      const images = screen.getAllByTestId('cloudinary-image')
      expect(images).toHaveLength(2)
    })
  })
})
