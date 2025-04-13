'use client'

import Image from 'next/image'
import cloudinaryLoader from '@/lib/cloudinaryLoader'

export default function CloudinaryImage({
  src,
  alt,
  fullLength = false,
  className = '',
  ...rest
}) {
  if (!src) return null

  const isCloudinary = typeof src === 'string' && src.includes('res.cloudinary.com')

  // Generate blurred placeholder
  const blurDataURL = isCloudinary
    ? src.replace('/upload/', '/upload/e_blur:1000,q_1/')
    : undefined

  // Aspect ratio logic
  const aspectRatio = fullLength ? (5 / 1) : (3 / 2) // 5:1 panoramic or 3:2 standard
  const paddingTop = 100 / aspectRatio // percent-based for CSS trick

  return (
    <div className={`relative w-full`} style={{ paddingTop: `${paddingTop}%` }}>
      <Image
        src={src}
        alt={alt}
        fill
        loader={isCloudinary ? cloudinaryLoader : undefined}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        className={`object-contain ${className}`}
        {...rest}
      />
    </div>
  )
}


