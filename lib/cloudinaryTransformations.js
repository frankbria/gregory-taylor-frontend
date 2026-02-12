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

  const rawFormat = merged.format ?? defaults.format
  const format = FORMAT_OPTIONS.includes(rawFormat) ? rawFormat : defaults.format
  const rawQuality = merged.quality ?? defaults.quality
  const quality = rawQuality === 'auto' ? 'auto'
    : Math.max(QUALITY_RANGE.min, Math.min(QUALITY_RANGE.max, Number(rawQuality) || 80))

  const parts = [`f_${format}`, `q_${quality}`]

  const sharpen = Math.max(SHARPEN_RANGE.min, Math.min(SHARPEN_RANGE.max, Number(merged.sharpen ?? 0) || 0))
  if (sharpen > 0) {
    parts.push(`e_sharpen:${sharpen}`)
  }

  const blur = Math.max(BLUR_RANGE.min, Math.min(BLUR_RANGE.max, Number(merged.blur ?? 0) || 0))
  if (blur > 0) {
    parts.push(`e_blur:${blur}`)
  }

  return parts.join(',')
}
