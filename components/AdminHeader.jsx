'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AdminHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/admin/login')
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <header className="bg-[#0a0000] text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-serif tracking-wide">
            ADMIN
          </Link>
          <Link href="/" className="text-sm hover:underline opacity-75">
            Back to Site
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-75">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
