// frontend/lib/api.js
export const fetchFromAPI = async (endpoint, options = {}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${endpoint}`, options)
  if (!res.ok) throw new Error('API Error')
  return res.json()
}

export async function getCategories() {
  const base = process.env.NEXT_PUBLIC_API_BASE 
    if (!base) {
        console.log('NEXT_PUBLIC_API_BASE is not defined')
        throw new Error('API base URL is not defined')
    }

  const res = await fetch(`${base}/api/categories`)

  if (!res.ok) {
    console.error('Failed to fetch categories:', res.statusText)
    throw new Error('Failed to fetch categories')
  }

  return res.json()
}

export async function getPhotosByCategory(slug) {
  const base = process.env.NEXT_PUBLIC_API_BASE || ''
  const res = await fetch(`${base}/api/gallery/${slug}`)

  if (!res.ok) {
    throw new Error('Failed to fetch category photos')
  }

  return res.json()
}

export async function getPhotoBySlug(slug) {
  const base = process.env.NEXT_PUBLIC_API_BASE || ''
  const res = await fetch(`${base}/api/photos/slug/${slug}`)

  if (!res.ok) {
    throw new Error('Failed to fetch photo')
  }

  return res.json()
}

export async function getFrames() {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) {
    console.error('NEXT_PUBLIC_API_BASE is not defined')
    throw new Error('API base URL is not defined')
  }

  try {
    console.log('Fetching frames from:', `${base}/api/frames`)
    const res = await fetch(`${base}/api/frames`)
    
    if (!res.ok) {
      console.error('Failed to fetch frames:', res.status, res.statusText)
      throw new Error(`Failed to fetch frames: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    console.log('Frames fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error in getFrames:', error)
    throw error
  }
}

export async function getSizes() {
  const base = process.env.NEXT_PUBLIC_API_BASE || ''
  const res = await fetch(`${base}/api/sizes`)

  if (!res.ok) {
    throw new Error('Failed to fetch sizes')
  }

  return res.json()
}

export async function getFormats() {
  const base = process.env.NEXT_PUBLIC_API_BASE || ''
  const res = await fetch(`${base}/api/formats`)

  if (!res.ok) {
    throw new Error('Failed to fetch formats')
  }

  return res.json()
}

export async function getOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return null

  const { width = 800, height = null, crop = 'scale' } = options
  const transformParts = [`f_auto`, `q_auto`, `c_${crop}`, `w_${width}`]
  if (height) transformParts.push(`h_${height}`)

  return imageUrl.replace('/upload/', `/upload/${transformParts.join(',')}/`)
}
