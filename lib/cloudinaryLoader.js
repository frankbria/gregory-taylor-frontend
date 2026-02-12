// lib/cloudinaryLoader.js

import { buildTransformationString } from './cloudinaryTransformations'

const cloudinaryLoader = ({ src, width, quality, customSettings }) => {
  if (!src) return null

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return src

  // Strip domain if passed a full Cloudinary URL
  const relativeSrc = src.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '')

  // When customSettings is provided and non-empty, use buildTransformationString
  if (customSettings && Object.keys(customSettings).length > 0) {
    const transformations = buildTransformationString(customSettings)
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations},w_${width}/${relativeSrc}`
  }

  // Backward-compatible: exact same URL format as before
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality || 'auto'},w_${width}/${relativeSrc}`
}

export default cloudinaryLoader
