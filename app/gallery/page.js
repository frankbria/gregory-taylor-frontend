// frontend/app/gallery/page.js

'use client'

import CategoryGrid from '@/components/CategoryGrid'

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Gallery</h1>
      <CategoryGrid />
    </div>
  )
}
