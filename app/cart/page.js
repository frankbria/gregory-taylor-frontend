'use client'

import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { FaTrash } from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe'
import CloudinaryImage from '@/components/CloudinaryImage'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsLoading(true)
    try {
      // Create a checkout session with Stripe
      const session = await createCheckoutSession(cart)
      
      // Redirect to the checkout page
      const result = await redirectToCheckout(session.id)
      
      if (result.success) {
        toast.success('Redirecting to checkout...')
        // In a real implementation, the user would be redirected to Stripe
        // For now, we'll just show a success message
      } else {
        toast.error('Failed to redirect to checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Checkout failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-serif mb-6">Your Shopping Cart</h1>
        <p className="mb-8">Your cart is empty.</p>
        <Link 
          href="/gallery" 
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8 text-center">Your Shopping Cart</h1>
      
      <div className="space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-200 rounded">
            <div className="w-full md:w-1/4">
              {item.imageUrl && (
                <div className="aspect-[3/2] relative overflow-hidden rounded">
                  <CloudinaryImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="w-full md:w-3/4 space-y-2">
              <h3 className="text-xl font-medium">{item.title}</h3>
              
              <div className="text-sm text-gray-600">
                {item.size && <p>Size: {item.size}</p>}
                {item.frame && <p>Frame: {item.frame}</p>}
                {item.format && <p>Format: {item.format}</p>}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <label htmlFor={`quantity-${item.id}`} className="mr-2">Quantity:</label>
                  <select
                    id={`quantity-${item.id}`}
                    value={item.quantity || 1}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="border rounded p-1"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="font-medium">${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Total</h2>
          <p className="text-2xl font-bold">${getTotalPrice().toFixed(2)}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <button
            onClick={clearCart}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Clear Cart
          </button>
          
          <div className="flex gap-4">
            <Link
              href="/gallery"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Continue Shopping
            </Link>
            
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 