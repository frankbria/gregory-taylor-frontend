'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FaFolderOpen } from 'react-icons/fa'
import { getCategories } from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'
import CategoryGridSkeleton from '@/components/CategoryGridSkeleton'
import withInspector from '@/lib/withInspector'

function CategoryGrid() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        toast.error('Failed to load categories')
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <CategoryGridSkeleton count={6} />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">Failed to load categories.</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <FaFolderOpen className="w-20 h-20 mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-2">No gallery categories available yet.</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Check back soon for new photography collections.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {categories.map(category => (
        <Link
          key={category._id}
          href={`/gallery/${category.slug}`}
          className="block group rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
        >
          <div className="flex flex-col h-[280px]">
            <div className="relative flex-1 overflow-hidden">
              {category.displayUrl ? (
                <CloudinaryImage
                  src={category.displayUrl}
                  alt={category.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  aspectRatio={category.aspectRatio}
                  width={category.width}
                  height={category.height}
                  customSettings={category.imageSettings}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4 text-center text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
              {category.name}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default withInspector(CategoryGrid, {
  componentName: 'CategoryGrid',
  filePath: 'components/CategoryGrid.jsx',
})
