'use client'

import Link from 'next/link'
import { HiHome, HiDocumentText, HiPhoto, HiSquares2X2 } from 'react-icons/hi2'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: HiHome },
  { href: '/admin/content', label: 'Content', icon: HiDocumentText },
  { href: '/admin/images', label: 'Images', icon: HiPhoto },
  { href: '/admin/layout-settings', label: 'Layout', icon: HiSquares2X2 },
]

export default function AdminNav({ currentPath }) {
  return (
    <nav className="w-56 bg-[#0a0000] text-white min-h-screen p-4">
      <ul className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = currentPath === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
