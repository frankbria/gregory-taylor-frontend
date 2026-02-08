'use client'

import { useAuth } from '@/lib/AuthContext'
import AdminHeader from '@/components/AdminHeader'

export default function AdminLayout({ children }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}
