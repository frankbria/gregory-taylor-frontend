'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import AdminHeader from '@/components/AdminHeader'
import AdminNav from '@/components/admin/AdminNav'
import { ContentProvider } from '@/lib/ContentContext'

export default function AdminLayout({ children }) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  return (
    <ContentProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminNav currentPath={pathname} />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
            {children}
          </main>
        </div>
      </div>
    </ContentProvider>
  )
}
