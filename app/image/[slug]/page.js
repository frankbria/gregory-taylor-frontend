'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { RoomPreviews } from '@/components/RoomPreviews'
import { getPhotoBySlug } from '@/lib/api'

export default function ImageDetailPage() {
  const { slug } = useParams()
  const [photo, setPhoto] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedFrame, setSelectedFrame] = useState('')

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const data = await getPhotoBySlug(slug)
        setPhoto(data)
      } catch (err) {
        console.error('Error loading photo:', err)
        toast.error('Failed to load image details')
      }
    }

    fetchPhoto()
  }, [slug])

  if (!photo) return null

  // Handle size selection
  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value)
  }

  // Handle frame selection
  const handleFrameChange = (e) => {
    setSelectedFrame(e.target.value)
  }

  // Get the selected size price
  const getSelectedSizePrice = () => {
    if (!selectedSize || !photo.availableSizes) return null
    
    const size = photo.availableSizes.find(s => s._id === selectedSize || s.name === selectedSize)
    return size ? size.price : null
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10 text-white">
        {/* Hero Image */}
        <div className="w-full aspect-[3/2] relative overflow-hidden rounded shadow">
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-wide uppercase font-serif text-white">{photo.title}</h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed">{photo.description}</p>
        </div>

        {/* Main Detail Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Room Previews */}
          <div className="md:w-2/3">
            <RoomPreviews photoPublicId={photo.publicID} />
          </div>

          {/* Info Panel */}
          <div className="md:w-1/3 space-y-4 text-sm text-gray-200">
            <div className="text-2xl font-semibold text-white">
              {getSelectedSizePrice() ? `$${getSelectedSizePrice().toFixed(2)}` : 'Select a size'}
            </div>
            <ul className="space-y-1">
              <li><strong>Location:</strong> {photo.location}</li>
            </ul>

            {/* Print Options */}
            <div className="pt-4 space-y-4">
              <div>
                <label htmlFor="size" className="block mb-1 font-medium text-white">Print Size</label>
                <select 
                  id="size" 
                  className="w-full border p-2 rounded bg-gray-800 text-white"
                  value={selectedSize}
                  onChange={handleSizeChange}
                >
                  <option value="">Choose an option</option>
                  {photo.availableSizes && photo.availableSizes.map((size) => (
                    <option key={size._id} value={size._id}>
                      {size.name} - ${size.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="frame" className="block mb-1 font-medium text-white">Frame Style</label>
                <select 
                  id="frame" 
                  className="w-full border p-2 rounded bg-gray-800 text-white"
                  value={selectedFrame}
                  onChange={handleFrameChange}
                >
                  <option value="">Choose an option</option>
                  <option value="none">No Frame</option>
                  <option value="black">Black Frame</option>
                  <option value="white">White Frame</option>
                  <option value="natural">Natural Wood</option>
                </select>
              </div>

              <button 
                className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                disabled={!selectedSize}
              >
                Add to Cart
              </button>
            </div>

            <div className="pt-4 text-xs text-gray-300">
              Category: {photo.category?.name || 'Uncategorized'}
            </div>
          </div>
        </div>
        <div className="text-center">
          <Link href="/gallery" className="inline-block mt-6 text-sm border border-white text-white px-4 py-2 rounded hover:bg-gray-800">
            BACK TO COLLECTION
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
