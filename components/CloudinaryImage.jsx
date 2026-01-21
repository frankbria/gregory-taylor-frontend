'use client'

import Image from 'next/image'
import cloudinaryLoader from '@/lib/cloudinaryLoader'

export default function CloudinaryImage({
  src,
  alt,
  fullLength = false,
  aspectRatio: aspectRatioProp,
  width,
  height,
  objectFit,
  className = '',
  ...rest
}) {
  if (!src) return null

  const isCloudinary = typeof src === 'string' && src.includes('res.cloudinary.com')

  // Generate blurred placeholder with width parameter for better performance
  const blurDataURL = isCloudinary
    ? src.replace('/upload/', '/upload/e_blur:1000,q_1,w_50/')
    : undefined

  // Calculate aspect ratio with priority order:
  // 1. Use aspectRatio prop if provided and valid (finite positive number)
  // 2. Calculate from width and height if both provided
  // 3. Fall back to fullLength (5:1) if true
  // 4. Default to 3:2 for backward compatibility
  const isValidAspectRatio = Number.isFinite(aspectRatioProp) && aspectRatioProp > 0

  const isValidDimension = (val) => Number.isFinite(val) && val > 0

  let calculatedRatio
  if (isValidAspectRatio) {
    calculatedRatio = aspectRatioProp
  } else if (isValidDimension(width) && isValidDimension(height)) {
    calculatedRatio = width / height
  } else if (fullLength) {
    calculatedRatio = 5 / 1
  } else {
    calculatedRatio = 3 / 2
  }

  const paddingTop = 100 / calculatedRatio // percent-based for CSS trick

  // Determine object-fit:
  // - If objectFit prop is explicitly provided, use it
  // - For very wide images (aspectRatio > 2.5), use 'contain' to prevent cropping
  // - Otherwise use 'cover' as default
  let effectiveObjectFit
  if (objectFit !== undefined) {
    effectiveObjectFit = objectFit
  } else if (calculatedRatio > 2.5) {
    effectiveObjectFit = 'contain'
  } else {
    effectiveObjectFit = 'cover'
  }

  // Map object-fit values to Tailwind classes
  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }
  const objectFitClass = objectFitClasses[effectiveObjectFit] || 'object-cover'

  return (
    <div className={`relative w-full`} style={{ paddingTop: `${paddingTop}%` }}>
      <Image
        src={src}
        alt={alt}
        fill
        loader={isCloudinary ? cloudinaryLoader : undefined}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        className={`${objectFitClass} ${className}`}
        {...rest}
      />
    </div>
  )
}


