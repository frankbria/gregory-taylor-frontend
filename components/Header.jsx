'use client'

import Link from 'next/link'
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '@/lib/CartContext'

export default function Header() {
  const { cartCount } = useCart()

  return (
    <header className="bg-[#0a0000] text-white">
      {/* Site Title */}
      <div className="py-6 text-center">
        <h1 className="text-4xl font-serif tracking-wide">GREG TAYLOR PHOTOGRAPHY</h1>
      </div>

      {/* Navigation */}
      <nav className="bg-black text-white uppercase text-sm tracking-wide py-2">
        <div className="max-w-5xl mx-auto flex justify-center items-center gap-6 relative">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/gallery" className="hover:underline">Gallery</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/orders" className="hover:underline">My Orders</Link>

          {/* Cart icon positioned on the right edge */}
          <div className="absolute right-60 flex items-center space-x-1">
            <Link href="/cart" className="flex items-center hover:text-blue-400 transition">
              <FaShoppingCart />
              <span className="ml-1">{cartCount}</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

