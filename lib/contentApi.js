'use client'

import { useError } from './ErrorContext'

const useContentAPI = () => {
  const { handleApiError } = useError()

  const getAllPages = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/pages`)
      if (!res.ok) throw new Error(`Failed to fetch pages: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getAllPages')
      throw error
    }
  }

  const getPageContent = async (pageId) => {
    try {
      if (!pageId) throw new Error('pageId is required')

      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/pages/${pageId}`)
      if (!res.ok) throw new Error(`Failed to fetch page content: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getPageContent')
      throw error
    }
  }

  const updatePageContent = async (pageId, content) => {
    try {
      if (!pageId) throw new Error('pageId is required')

      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      })
      if (!res.ok) throw new Error(`Failed to update page content: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'updatePageContent')
      throw error
    }
  }

  const getImageSettings = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/settings/images`)
      if (!res.ok) throw new Error(`Failed to fetch image settings: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getImageSettings')
      throw error
    }
  }

  const updateImageSettings = async (settings) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/settings/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error(`Failed to update image settings: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'updateImageSettings')
      throw error
    }
  }

  const getLayoutSettings = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/settings/layout`)
      if (!res.ok) throw new Error(`Failed to fetch layout settings: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'getLayoutSettings')
      throw error
    }
  }

  const updateLayoutSettings = async (settings) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) throw new Error('API base URL is not defined')

      const res = await fetch(`${base}/api/admin/settings/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error(`Failed to update layout settings: ${res.status} ${res.statusText}`)

      return await res.json()
    } catch (error) {
      handleApiError(error, 'updateLayoutSettings')
      throw error
    }
  }

  const getPublicPageContent = async (pageId) => {
    try {
      if (!pageId) return null
      const base = process.env.NEXT_PUBLIC_API_BASE
      if (!base) return null

      const res = await fetch(`${base}/api/pages/${pageId}`)
      if (!res.ok) return null

      return await res.json()
    } catch {
      return null // Silent fail for public pages
    }
  }

  return {
    getAllPages,
    getPageContent,
    updatePageContent,
    getImageSettings,
    updateImageSettings,
    getLayoutSettings,
    updateLayoutSettings,
    getPublicPageContent
  }
}

export default useContentAPI

// Standalone exports for backward compatibility
export async function getAllPages() {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/pages`)
  if (!res.ok) throw new Error(`Failed to fetch pages: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function getPageContent(pageId) {
  if (!pageId) throw new Error('pageId is required')
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/pages/${pageId}`)
  if (!res.ok) throw new Error(`Failed to fetch page content: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function updatePageContent(pageId, content) {
  if (!pageId) throw new Error('pageId is required')
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/pages/${pageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  })
  if (!res.ok) throw new Error(`Failed to update page content: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function getImageSettings() {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/settings/images`)
  if (!res.ok) throw new Error(`Failed to fetch image settings: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function updateImageSettings(settings) {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/settings/images`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  })
  if (!res.ok) throw new Error(`Failed to update image settings: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function getLayoutSettings() {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/settings/layout`)
  if (!res.ok) throw new Error(`Failed to fetch layout settings: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function updateLayoutSettings(settings) {
  const base = process.env.NEXT_PUBLIC_API_BASE
  if (!base) throw new Error('API base URL is not defined')

  const res = await fetch(`${base}/api/admin/settings/layout`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  })
  if (!res.ok) throw new Error(`Failed to update layout settings: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function getPublicPageContent(pageId) {
  try {
    if (!pageId) return null
    const base = process.env.NEXT_PUBLIC_API_BASE
    if (!base) return null
    const res = await fetch(`${base}/api/pages/${pageId}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
