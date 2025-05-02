// frontend/app/cart/success/page.js

'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/CartContext'
import { useSearchParams, useRouter } from 'next/navigation'

export default function CartSuccessPage() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const router = useRouter()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif mb-4 text-green-700">Thank you for your purchase!</h1>
      <p className="mb-6">Your payment was successful. Your order is being processed and will be shipped soon.</p>
      {sessionId && (
        <p className="mb-6 text-sm text-gray-600">Session ID: {sessionId}</p>
      )}
      <button
        onClick={() => router.push('/gallery')}
        className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
      >
        Continue Shopping
      </button>
    </div>
  )
}