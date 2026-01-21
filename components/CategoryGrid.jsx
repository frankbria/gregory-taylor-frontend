'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { getCategories, getOptimizedImageUrl } from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'

export default function CategoryGrid() {
  const [categories, setCategories] = useState([])
  const [optimizedImages, setOptimizedImages] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
        
        // Pre-optimize all images
        const imagePromises = data.map(async category => {
          if (!category.featuredImage) return null
          try {
            const optimized = await getOptimizedImageUrl(category.featuredImage, {
              width: 360,
              height: 240,
              crop: 'fill'
            })
            return [category._id, optimized]
          } catch (err) {
            console.error(`Error optimizing image for category ${category._id}:`, err)
            return [category._id, null]
          }
        })

        const results = await Promise.all(imagePromises)
        const optimizedUrls = Object.fromEntries(results.filter(result => result !== null))
        setOptimizedImages(optimizedUrls)
      } catch (err) {
        console.error('Error fetching categories:', err)
        toast.error('Failed to load categories')
      }
    }

    fetchData()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {categories.map(category => {
        const optimizedImage = optimizedImages[category._id]

        return (
          <Link
            key={category._id}
            href={`/gallery/${category.slug}`}
            className="block group rounded overflow-hidden shadow hover:shadow-lg transition bg-white"
          >
            <div className="flex flex-col h-[280px]">
              <div className="relative flex-1 overflow-hidden">
                {optimizedImage ? (
                  <CloudinaryImage
                    src={optimizedImage}
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    aspectRatio={category.aspectRatio}
                    width={category.width}
                    height={category.height}
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
        )
      })}
    </div>
  )
}
