'use client'

import { buildTransformationString } from '@/lib/cloudinaryTransformations'

function buildImageUrl(src, settings) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return src

  const relativeSrc = src.replace(
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//,
    ''
  )
  const transformations = buildTransformationString(settings)
  if (!transformations) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${relativeSrc}`
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${relativeSrc}`
}

function formatSettingsDetails(settings) {
  if (!settings) return 'Quality: auto, Format: auto'

  const parts = []
  parts.push(`Quality: ${settings.quality ?? 'auto'}`)
  if (settings.sharpen && settings.sharpen > 0) {
    parts.push(`Sharpen: ${settings.sharpen}`)
  }
  if (settings.blur && settings.blur > 0) {
    parts.push(`Blur: ${settings.blur}`)
  }
  parts.push(`Format: ${settings.format ?? 'auto'}`)
  return parts.join(', ')
}

export default function CloudinaryPreview({ src, currentSettings, previewSettings }) {
  if (!src) return null

  const currentUrl = buildImageUrl(src, currentSettings)
  const previewUrl = buildImageUrl(src, previewSettings)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="font-semibold text-sm mb-2">Current</p>
        <img
          src={currentUrl}
          alt="Current version"
          className="max-h-64 object-contain w-full rounded"
        />
        <p className="text-xs text-gray-500 mt-2">
          {formatSettingsDetails(currentSettings)}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="font-semibold text-sm mb-2">Preview</p>
        <img
          src={previewUrl}
          alt="Preview version"
          className="max-h-64 object-contain w-full rounded"
        />
        <p className="text-xs text-gray-500 mt-2">
          {formatSettingsDetails(previewSettings)}
        </p>
      </div>
    </div>
  )
}
