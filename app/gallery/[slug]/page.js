// frontend/app/gallery/[slug]/page.js
// TODO: test full length image display

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { getPhotosByCategory } from '@/lib/api'

export default function CategoryGalleryPage() {
  const { slug } = useParams()
  const [photos, setPhotos] = useState([])
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { category, photos } = await getPhotosByCategory(slug)
        setPhotos(photos)
        setCategoryName(category.name)
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

          return (
            <div
              key={photo._id}
              className={`group relative overflow-hidden rounded shadow hover:shadow-lg transition bg-white ${
                isFullLength ? 'md:col-span-3' : ''
              }`}
            >
              <div className="relative w-full aspect-[3/2] overflow-hidden">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="text-center text-sm font-serif tracking-wide uppercase text-gray-600 py-2">
                {photo.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
