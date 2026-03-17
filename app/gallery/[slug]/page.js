// frontend/app/gallery/[slug]/page.js
// TODO: test full length image display

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { getPhotosByCategory } from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'
import ImageGridSkeleton from '@/components/ImageGridSkeleton'

export default function CategoryGalleryPage() {
  const { slug } = useParams()
  const [photos, setPhotos] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { category, photos } = await getPhotosByCategory(slug)
        setPhotos(photos)
        setCategoryName(category.name)
      } catch (err) {
        console.error('Error loading category photos:', err)
        toast.error('Failed to load photos for this category')
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="border-b pb-2 text-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2 animate-pulse" />
        </div>
        <ImageGridSkeleton count={12} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p className="text-red-600 text-lg">Failed to load photos for this category.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b pb-2 text-center">
        <h1 className="text-3xl font-bold text-white">{categoryName}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo, index) => {
          // Use aspectRatio if available, otherwise fall back to fullLength for wide column span
          const isWideImage = photo.aspectRatio > 2 || (photo.fullLength && index % 3 === 0)

          return (
            <Link
              href={`/image/${photo.slug}`}
              key={photo._id}
              className={`group relative overflow-hidden rounded shadow hover:shadow-lg transition bg-white ${
                isWideImage ? 'md:col-span-3' : ''
              }`}
            >
              <div className={`relative w-full overflow-hidden`}>
                {photo.displayUrl ? (
                  <CloudinaryImage
                    src={photo.displayUrl}
                    alt={photo.title}
                    className="group-hover:scale-105 transition-transform duration-300"
                    fullLength={photo.fullLength}
                    aspectRatio={photo.aspectRatio}
                    width={photo.width}
                    height={photo.height}
                    customSettings={photo.imageSettings}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    No Image
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
