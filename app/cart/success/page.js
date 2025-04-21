import React from 'react';
import Link from 'next/link';

export default function CartSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif mb-4 text-green-700">Thank you for your purchase!</h1>
      <p className="mb-6">Your payment was successful. Your order is being processed and will be shipped soon.</p>
      <Link href="/gallery">
        <a className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition">Continue Shopping</a>
      </Link>
      <Link href="/gallery">
        <a className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition">Continue Shopping</a>
      </Link>
    </div>
  )
}