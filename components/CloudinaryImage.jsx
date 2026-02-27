'use client'

import { useState } from 'react'
import Image from 'next/image'
import cloudinaryLoader from '@/lib/cloudinaryLoader'
import withInspector from '@/lib/withInspector'

const FALLBACK_SRC = '/placeholder-image.svg'

function CloudinaryImage({
  src,
  alt,
  fullLength = false,
  aspectRatio: aspectRatioProp,
  width,
  height,
  objectFit,
  className = '',
  customSettings,
  ...rest
}) {
  const [hasError, setHasError] = useState(false)

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

  const handleError = () => {
    console.error(`Failed to load image: ${src}`)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div
        className={`relative w-full bg-gray-200 flex items-center justify-center`}
        style={{ paddingTop: `${paddingTop}%` }}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <span className="text-sm">Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full`} style={{ paddingTop: `${paddingTop}%` }}>
      <Image
        src={src}
        alt={alt}
        fill
        loader={isCloudinary ? (props) => cloudinaryLoader({ ...props, customSettings }) : undefined}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        className={`${objectFitClass} ${className}`}
        onError={handleError}
        {...rest}
      />
    </div>
  )
}

export default withInspector(CloudinaryImage, {
  componentName: 'CloudinaryImage',
  filePath: 'components/CloudinaryImage.jsx',
})
