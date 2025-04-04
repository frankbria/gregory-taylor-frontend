'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { getCategories } from '@/lib/api'

export default function CategoryGrid() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        toast.error('Failed to load categories')
      }
    }

    fetchData()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {categories.map(category => (
        <Link
          key={category._id}
          href={`/gallery/${category.slug}`}
          className="block group rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
        >
          <div className="relative aspect-square">
            {category.featuredImage ? (
              <Image
                src={category.featuredImage}
                alt={category.name}
                fill
                className="object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="p-4 text-center text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
            {category.name}
          </div>
        </Link>
      ))}
    </div>
  )
}
