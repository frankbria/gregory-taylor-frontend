// frontend/app/gallery/[slug]/page.js
// TODO: test full length image display

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { getPhotosByCategory, getOptimizedImageUrl } from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'

export default function CategoryGalleryPage() {
  const { slug } = useParams()
  const [photos, setPhotos] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [optimizedImages, setOptimizedImages] = useState({})

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { category, photos } = await getPhotosByCategory(slug)
        setPhotos(photos)
        setCategoryName(category.name)

        // Pre-optimize all images
        const imagePromises = photos.map(async photo => {
          if (!photo.imageUrl) return null
          try {
            const isFullLength = photo.fullLength
            const optimized = await getOptimizedImageUrl(photo.imageUrl, {
              width: isFullLength ? 1200 : 800,
              crop: isFullLength ? 'fit' : 'fill',
            })
            return [photo._id, optimized]
          } catch (err) {
            console.error(`Error optimizing image for photo ${photo._id}:`, err)
            return [photo._id, null]
          }
        })

        const results = await Promise.all(imagePromises)
        const optimizedUrls = Object.fromEntries(results.filter(result => result !== null))
        setOptimizedImages(optimizedUrls)
      } catch (err) {
        console.error('Error loading category photos:', err)
        toast.error('Failed to load photos for this category')
      }
    }

    fetchPhotos()
  }, [slug])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b pb-2 text-center">
        <h1 className="text-3xl font-bold text-white">{categoryName}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo, index) => {
          const isFullLength = photo.fullLength && index % 3 === 0
          const optimizedImage = optimizedImages[photo._id]

          return (
            <Link
              href={`/image/${photo.slug}`}
              key={photo._id}
              className={`group relative overflow-hidden rounded shadow hover:shadow-lg transition bg-white ${
                isFullLength ? 'md:col-span-3' : ''
              }`}
            >
              <div className={`relative w-full overflow-hidden`}>
                {optimizedImage ? (
                  <CloudinaryImage
                    src={optimizedImage}
                    alt={photo.title}
                    className="group-hover:scale-105 transition-transform duration-300"
                    fullLength={photo.fullLength}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    Loading...
                  </div>
                )}
              </div>
              <div className="text-center text-sm font-serif tracking-wide uppercase text-gray-600 py-2">
                {photo.title}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
