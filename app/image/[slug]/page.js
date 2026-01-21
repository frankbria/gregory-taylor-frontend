'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { RoomPreviews } from '@/components/RoomPreviews'
import { getPhotoBySlug, getSizes, getFrames, getFormats } from '@/lib/api'
import CloudinaryImage from '@/components/CloudinaryImage'
import { useCart } from '@/lib/CartContext'

export default function ImageDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [photo, setPhoto] = useState(null)
  const [sizes, setSizes] = useState([])
  const [frames, setFrames] = useState([])
  const [formats, setFormats] = useState([])
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch photo data
        const photoData = await getPhotoBySlug(slug)
        console.log('Photo data:', photoData)
        setPhoto(photoData)

        // Fetch sizes data
        const sizesData = await getSizes()
        // Sort sizes by price (lowest to highest)
        const sortedSizes = [...sizesData].sort((a, b) => a.price - b.price)
        setSizes(sortedSizes)
        // Set default to lowest price size
        if (sortedSizes.length > 0) {
          setSelectedSize(sortedSizes[0])
        }

        // Fetch frames data
        const framesData = await getFrames()
        // Sort frames by price (lowest to highest)
        const sortedFrames = [...framesData].sort((a, b) => a.price - b.price)
        setFrames(sortedFrames)
        // Set default to lowest price frame
        if (sortedFrames.length > 0) {
          setSelectedFrame(sortedFrames[0])
        }

        // Fetch formats data
        const formatsData = await getFormats()
        // Sort formats by price (lowest to highest)
        const sortedFormats = [...formatsData].sort((a, b) => a.price - b.price)
        setFormats(sortedFormats)
        // Set default to lowest price format
        if (sortedFormats.length > 0) {
          setSelectedFormat(sortedFormats[0])
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load image details')
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const calculateTotalPrice = () => {
    let total = 0
    if (selectedSize && typeof selectedSize.price === 'number' && !isNaN(selectedSize.price)) {
      total += selectedSize.price
    }
    if (selectedFrame && typeof selectedFrame.price === 'number' && !isNaN(selectedFrame.price)) {
      total += selectedFrame.price
    }
    if (selectedFormat && typeof selectedFormat.price === 'number' && !isNaN(selectedFormat.price)) {
      total += selectedFormat.price
    }
    return total
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      return toast.error('Please select a size')
    }
    if (!selectedFormat) {
      return toast.error('Please select a format')
    }

    // Create a unique ID for the cart item
    const itemId = `${photo._id}-${selectedSize._id}-${selectedFrame?._id || 'no-frame'}-${selectedFormat._id}`
    
    // Create the cart item
    const cartItem = {
      id: itemId,
      photoId: photo._id,
      title: photo.title,
      displayUrl: photo.displayUrl,
      price: calculateTotalPrice(),
      size: `${selectedSize.width}" × ${selectedSize.height}"`,
      frame: selectedFrame ? selectedFrame.style : 'No Frame',
      format: selectedFormat.name,
      quantity: 1
    }

    // Add to cart
    addToCart(cartItem)
    toast.success('Added to cart!')
    // Redirect to cart page
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Photo not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10 text-white">
      {/* Hero Image */}
      <div className="w-full relative overflow-hidden rounded shadow">
        {photo.displayUrl ? (
          <CloudinaryImage
            src={photo.displayUrl}
            alt={photo.title}
            className=""
            fullLength={photo.fullLength}
            aspectRatio={photo.aspectRatio}
            width={photo.width}
            height={photo.height}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-wide uppercase font-serif text-white">{photo.title}</h1>
        {photo.location && (
          <p className="text-white">Location: {photo.location}</p>
        )}
        <p className="max-w-3xl mx-auto text-lg text-white leading-relaxed">{photo.description}</p>
      </div>

      {/* Main Detail Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Room Previews */}
        <div className="md:w-2/3">
          {photo.publicID && (
            <RoomPreviews photoPublicId={photo.publicID} />
          )}
        </div>

        {/* Info Panel */}
        <div className="md:w-1/3 space-y-4 text-sm text-white">
          <div className="text-2xl font-semibold text-white">
            ${calculateTotalPrice().toFixed(2)}
          </div>
          
          {photo.category && (
            <div className="mb-4">
              <span className="font-medium text-white">Category:</span>
              <Link 
                href={`/gallery/${photo.category.slug}`}
                className="ml-2 text-blue-400 hover:underline"
              >
                {photo.category.name}
              </Link>
            </div>
          )}

          {/* Purchase Options */}
          <div className="pt-4 space-y-4">
            {/* Size Selection */}
            <div>
              <label className="block mb-1 font-medium text-white">Print Size</label>
              <select
                value={selectedSize?._id || ''}
                onChange={e => {
                  const size = sizes.find(s => s._id === e.target.value)
                  setSelectedSize(size)
                }}
                className="w-full border p-2 rounded text-white bg-gray-800"
              >
                {sizes.map(size => (
                  <option key={size._id} value={size._id}>
                    {size.width}&quot; × {size.height}&quot; - ${size.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block mb-1 font-medium text-white">Format</label>
              <select
                value={selectedFormat?._id || ''}
                onChange={e => {
                  const format = formats.find(f => f._id === e.target.value)
                  setSelectedFormat(format)
                }}
                className="w-full border p-2 rounded text-white bg-gray-800"
              >
                {formats.map(format => (
                  <option key={format._id} value={format._id}>
                    {format.name} - ${format.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Frame Selection */}
            <div>
              <label className="block mb-1 font-medium text-white">Frame Style</label>
              <select
                value={selectedFrame?._id || ''}
                onChange={e => {
                  const frame = frames.find(f => f._id === e.target.value)
                  setSelectedFrame(frame)
                }}
                className="w-full border p-2 rounded text-white bg-gray-800"
              >
                {frames.map(frame => (
                  <option key={frame._id} value={frame._id}>
                    {frame.style} - ${frame.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/gallery" className="inline-block mt-6 text-sm border px-4 py-2 rounded hover:bg-gray-100 text-white">
          BACK TO COLLECTION
        </Link>
      </div>
    </div>
  )
}
