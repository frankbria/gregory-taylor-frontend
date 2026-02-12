// lib/cloudinaryTransformations.js

export const QUALITY_RANGE = { min: 1, max: 100 }
export const SHARPEN_RANGE = { min: 0, max: 400 }
export const BLUR_RANGE = { min: 0, max: 2000 }
export const FORMAT_OPTIONS = ['auto', 'webp', 'jpg', 'png', 'avif']

export function getTransformationDefaults() {
  return {
    quality: 'auto',
    sharpen: 0,
    blur: 0,
    format: 'auto',
  }
}

export function buildTransformationString(settings) {
  const defaults = getTransformationDefaults()
  const merged = { ...defaults, ...settings }

  const format = merged.format ?? defaults.format
  const quality = merged.quality ?? defaults.quality

  const parts = [`f_${format}`, `q_${quality}`]

  if (merged.sharpen && merged.sharpen > 0) {
    parts.push(`e_sharpen:${merged.sharpen}`)
  }

  if (merged.blur && merged.blur > 0) {
    parts.push(`e_blur:${merged.blur}`)
  }

  return parts.join(',')
}
