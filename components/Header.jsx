'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa'
import { useCart } from '@/lib/CartContext'
import withInspector from '@/lib/withInspector'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/orders', label: 'My Orders' },
]

function Header() {
  const { cartCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="bg-[#0a0000] text-white">
      {/* Site Title */}
      <div className="py-6 text-center">
        <h1 className="text-2xl md:text-4xl font-serif tracking-wide">GREG TAYLOR PHOTOGRAPHY</h1>
      </div>

      {/* Navigation */}
      <nav className="bg-black text-white uppercase text-sm tracking-wide py-2">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-6">
          {/* Desktop nav links */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:underline">{label}</Link>
            ))}
          </div>

          {/* Desktop cart */}
          <Link href="/cart" className="hidden md:flex items-center hover:text-blue-400 transition">
            <FaShoppingCart />
            <span className="ml-1">{cartCount}</span>
          </Link>

          {/* Mobile: hamburger + cart */}
          <div className="flex md:hidden flex-1 items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 hover:bg-gray-800 rounded transition"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            <Link href="/cart" className="flex items-center hover:text-blue-400 transition p-2">
              <FaShoppingCart />
              <span className="ml-1">{cartCount}</span>
            </Link>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="flex flex-col">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="px-6 py-3 hover:bg-gray-900 transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default withInspector(Header, {
  componentName: 'Header',
  filePath: 'components/Header.jsx',
})
