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

