// lib/cloudinaryLoader.js

// Get the cloud name from environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const cloudinaryLoader = ({ src, width, quality }) => {
  if (!src) return null

  // Strip domain if passed a full Cloudinary URL
  const relativeSrc = src.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '')

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality || 'auto'},w_${width}/${relativeSrc}`
}

export default cloudinaryLoader
