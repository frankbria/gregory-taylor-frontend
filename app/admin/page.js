'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { useContent } from '@/lib/ContentContext'
import { HiDocumentText, HiPhoto, HiSquares2X2 } from 'react-icons/hi2'

const navCards = [
  {
    href: '/admin/content',
    label: 'Content Editor',
    description: 'Edit page text, headings, and sections.',
    icon: HiDocumentText,
  },
  {
    href: '/admin/images',
    label: 'Image Settings',
    description: 'Configure image display and optimization.',
    icon: HiPhoto,
  },
  {
    href: '/admin/layout-settings',
    label: 'Layout Configuration',
    description: 'Manage navigation, footer, and site layout.',
    icon: HiSquares2X2,
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const { pages, loading, refreshPages } = useContent()

  useEffect(() => {
    refreshPages()
  }, [refreshPages])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold">{pages.length}</p>
              <p className="text-sm text-gray-500">Total Pages</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navCards.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition block"
              >
                <Icon className="w-8 h-8 text-gray-700 mb-3" />
                <h3 className="text-lg font-semibold mb-1">{label}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
