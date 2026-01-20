'use client'

import { useError } from './ErrorContext'

const useAPI = () => {
  const { handleApiError } = useError()

  const fetchFromAPI = async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${endpoint}`, options)
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
      return await res.json()
    } catch (error) {
      handleApiError(error, `fetchFromAPI:${endpoint}`)
      throw error
    }
  }

  const getCategories = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE 
      if (!base) {
        const error = new Error('API base URL is not defined')
        handleApiError(error, 'getCategories')
        throw error
      }

      const res = await fetch(`${base}/api/categories`)

      if (!res.ok) {
        const error = new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getCategories')
        throw error
      }

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getCategories')
      throw error
    }
  }

  const getPhotosByCategory = async (slug) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || ''
      const res = await fetch(`${base}/api/gallery/${slug}`)

      if (!res.ok) {
        const error = new Error(`Failed to fetch category photos: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getPhotosByCategory')
        throw error
      }

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getPhotosByCategory')
      throw error
    }
  }

  const getPhotoBySlug = async (slug) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || ''
      const res = await fetch(`${base}/api/photos/by-name/${slug}`)

      if (!res.ok) {
        const error = new Error(`Failed to fetch photo: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getPhotoBySlug')
        throw error
      }

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getPhotoBySlug')
      throw error
    }
  }

  const getFrames = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) {
        const error = new Error('API base URL is not defined')
        handleApiError(error, 'getFrames')
        throw error
      }

      console.log('Fetching frames from:', `${base}/api/frames`)
      const res = await fetch(`${base}/api/frames`)
      
      if (!res.ok) {
        const error = new Error(`Failed to fetch frames: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getFrames')
        throw error
      }

      const data = await res.json()
      console.log('Frames fetched successfully:', data)
      return data
    } catch (error) {
      handleApiError(error, 'getFrames')
      throw error
    }
  }

  const getSizes = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || ''
      const res = await fetch(`${base}/api/sizes`)

      if (!res.ok) {
        const error = new Error(`Failed to fetch sizes: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getSizes')
        throw error
      }

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getSizes')
      throw error
    }
  }

  const getFormats = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || ''
      const res = await fetch(`${base}/api/formats`)

      if (!res.ok) {
        const error = new Error(`Failed to fetch formats: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getFormats')
        throw error
      }

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getFormats')
      throw error
    }
  }

  const getFeaturedPhotos = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || ''
      // Use the existing photos endpoint but filter for featured photos on the client side
      const res = await fetch(`${base}/api/photos`)

      if (!res.ok) {
        const error = new Error(`Failed to fetch featured photos: ${res.status} ${res.statusText}`)
        handleApiError(error, 'getFeaturedPhotos')
        throw error
      }

      const photos = await res.json()
      // Filter for featured photos
      return photos.filter(photo => photo.featured)
    } catch (error) {
      handleApiError(error, 'getFeaturedPhotos')
      throw error
    }
  }

  return {
    fetchFromAPI,
    getCategories,
    getPhotosByCategory,
    getPhotoBySlug,
    getFrames,
    getSizes,
    getFormats,
    getFeaturedPhotos
  }
}

export default useAPI;

// Keeping the original functions for backwards compatibility
export const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${endpoint}`, options)
    if (!res.ok) {
      console.error(`API Error at ${endpoint}: ${res.status} ${res.statusText}`)
      throw new Error('API Error')
    }
    return await res.json()
  } catch (error) {
    console.error(`Error in fetchFromAPI: ${error.message}`)
    // Toast is handled within components that use this directly
    throw error
  }
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
  const res = await fetch(`${base}/api/photos/by-name/${slug}`)

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

export async function getFeaturedPhotos() {
  const base = process.env.NEXT_PUBLIC_API_BASE || ''
  const res = await fetch(`${base}/api/photos`)

  if (!res.ok) {
    throw new Error('Failed to fetch featured photos')
  }

  const photos = await res.json()
   
  // Filter for featured photos
  return photos.filter(photo => photo.featured)
}
