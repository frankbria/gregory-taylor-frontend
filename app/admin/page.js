'use client'

import { useAuth } from '@/lib/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Content Management</h2>
          <p className="text-gray-600">Manage photos, galleries, and site content.</p>
          <p className="text-sm text-gray-400 mt-4">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-gray-600">View and manage customer orders.</p>
          <p className="text-sm text-gray-400 mt-4">Coming soon</p>
        </div>
      </div>
    </div>
  )
}
