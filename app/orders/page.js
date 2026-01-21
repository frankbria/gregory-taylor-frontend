'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useAPI from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { getUserOrders } = useAPI()

  useEffect(() => {
    async function loadOrders() {
      try {
        const userId = localStorage.getItem('userId')

        if (!userId) {
          setOrders([])
          setLoading(false)
          return
        }

        const fetchedOrders = await getUserOrders(userId)
        setOrders(fetchedOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [getUserOrders])

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
        {orders.map((order) => (
          <div key={order._id} className="border rounded-lg p-6 shadow-sm">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  Order #{order._id.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">${order.totalAmount.toFixed(2)}</p>
                <span className={getStatusBadgeClasses(order.status)}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 border-t pt-3">
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <CloudinaryImage
                      src={item.imageUrl}
                      alt={item.title}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.size} &bull; {item.frame} &bull; {item.format}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} &bull; ${item.unitPrice.toFixed(2)} each
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
