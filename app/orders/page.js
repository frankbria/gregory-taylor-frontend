'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import useAPI from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { getUserOrders } = useAPI()

  const loadOrders = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId')

      if (!userId) {
        setOrders([])
        setLoading(false)
        return
      }

      const fetchedOrders = await getUserOrders(userId)
      setOrders(fetchedOrders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const getStatusBadgeClasses = (status) => {
    const baseClasses = 'inline-block px-3 py-1 rounded-full text-sm'
    switch (status) {
      case 'fulfilled':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'paid':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatOrderId = (id) => {
    if (!id || typeof id !== 'string') return 'N/A'
    return id.length >= 8 ? id.slice(-8) : id
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
  }

  const formatPrice = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00'
    return `$${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p>Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-serif mb-6">My Orders</h1>
        <div className="bg-gray-100 rounded-lg p-8">
          <p className="mb-6">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/gallery"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            Browse Gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8 text-center">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order, orderIndex) => (
          <div key={order._id || `order-${orderIndex}`} className="border rounded-lg p-6 shadow-sm">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  Order #{formatOrderId(order._id)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">{formatPrice(order.totalAmount)}</p>
                <span className={getStatusBadgeClasses(order.status)}>
                  {order.status || 'unknown'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={item._id || `${order._id}-item-${index}`} className="flex items-center gap-4 border-t pt-3">
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <CloudinaryImage
                      src={item.imageUrl}
                      alt={item.title || 'Order item'}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.title || 'Untitled'}</p>
                    <p className="text-sm text-gray-600">
                      {[item.size, item.frame, item.format].filter(Boolean).join(' • ') || 'No details'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity || 1} • {formatPrice(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {order.status === 'fulfilled' && (
              <div className="border-t mt-4 pt-4">
                <button
                  onClick={() => window.print()}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Print Receipt
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
