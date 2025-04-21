import React from 'react';

export default function CartCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif mb-4 text-red-700">Payment Not Completed</h1>
      <p className="mb-6">Your payment was not successful or was canceled. No charges have been made.</p>
      <p className="mb-8">You can try again or contact us if you need assistance.</p>
      <a href="/cart" className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition">Return to Cart</a>
    </div>
  )
}
