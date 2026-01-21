'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/CartContext'
import { FaTrash } from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe'
import CloudinaryImage from '@/components/CloudinaryImage'
import { getSizes, getFrames, getFormats } from '@/lib/api'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [sizes, setSizes] = useState([])
  const [frames, setFrames] = useState([])
  const [formats, setFormats] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [sizesData, framesData, formatsData] = await Promise.all([
          getSizes(),
          getFrames(),
          getFormats(),
        ])
        setSizes(sizesData)
        setFrames(framesData)
        setFormats(formatsData)
      } catch (err) {
        console.error('Error loading price data:', err)
      }
    }
    fetchData()
  }, [])

  function getItemPrice(item) {
    // Use item.price if present and valid, otherwise fall back to calculated (for display only)
    if (typeof item.price === 'number' && !isNaN(item.price)) {
      return item.price
    }
    let price = 0
    if (item.sizeId) {
      const size = sizes.find(s => s._id === item.sizeId)
      if (size) price += size.price
    }
    if (item.frameId) {
      const frame = frames.find(f => f._id === item.frameId)
      if (frame) price += frame.price
    }
    if (item.formatId) {
      const format = formats.find(f => f._id === item.formatId)
      if (format) price += format.price
    }
    return price
  }

  function getTotalPrice() {
    return cart.reduce((total, item) => {
      const itemPrice = getItemPrice(item)
      return total + itemPrice * (item.quantity || 1)
    }, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsLoading(true)
    try {
      // Create a checkout session with Stripe
      const session = await createCheckoutSession(cart)
      // Redirect to the Stripe-hosted checkout page
      const result = await redirectToCheckout(session.id)
      if (result.success) {
        toast.success('Redirecting to Stripe checkout...')
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
              {item.displayUrl && (
                <div className="aspect-[3/2] relative overflow-hidden rounded">
                  <CloudinaryImage
                    src={item.displayUrl}
                    alt={item.title}
                    aspectRatio={item.aspectRatio}
                    width={item.width}
                    height={item.height}
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
                    className="border rounded p-1 bg-white text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:text-black"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num} className="bg-white text-gray-800">
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="font-medium">${(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}</p>
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
            className="px-4 py-2 border border-gray-300 rounded text-white hover:bg-gray-200 hover:text-black transition"
          >
            Clear Cart
          </button>
          
          <div className="flex gap-4">
            <Link
              href="/gallery"
            className="px-4 py-2 border border-gray-300 rounded text-white hover:bg-gray-200 hover:text-black transition"
            >
              Continue Shopping
            </Link>
            
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-green-400 via-blue-500 to-blue-700 text-white font-bold text-lg rounded shadow-lg hover:from-green-500 hover:to-blue-800 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}