'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import useContentAPI from './contentApi'
import useAPI from './api'

const ContentContext = createContext()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function ContentProvider({ children }) {
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const [imageSettings, setImageSettings] = useState(null)
  const [layoutSettings, setLayoutSettings] = useState(null)
  const [photoImageSettings, setPhotoImageSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const isRefreshing = useRef(false)

  const api = useContentAPI()
  const photoApi = useAPI()
  const pendingPhotoRequests = useRef({})

  const isCacheFresh = useCallback(() => {
    if (!lastRefresh) return false
    return Date.now() - lastRefresh < CACHE_TTL
  }, [lastRefresh])

  const refreshPages = useCallback(async () => {
    if (isCacheFresh() || isRefreshing.current) return

    isRefreshing.current = true
    setLoading(true)
    try {
      const data = await api.getAllPages()
      setPages(data)
      setLastRefresh(Date.now())
    } finally {
      setLoading(false)
      isRefreshing.current = false
    }
  }, [isCacheFresh, api])

  const selectPage = useCallback(async (pageId) => {
    const page = await api.getPageContent(pageId)
    setCurrentPage(page)
  }, [api])

  const updatePage = useCallback(async (pageId, content) => {
    setLoading(true)
    try {
      await api.updatePageContent(pageId, content)
      setLastRefresh(null)
      const data = await api.getAllPages()
      setPages(data)
      setLastRefresh(Date.now())
    } finally {
      setLoading(false)
    }
  }, [api])

  const refreshImageSettings = useCallback(async () => {
    const data = await api.getImageSettings()
    setImageSettings(data)
  }, [api])

  const updateImageSettings = useCallback(async (settings) => {
    await api.updateImageSettings(settings)
    const data = await api.getImageSettings()
    setImageSettings(data)
  }, [api])

  const refreshLayoutSettings = useCallback(async () => {
    const data = await api.getLayoutSettings()
    setLayoutSettings(data)
  }, [api])

  const updateLayoutSettings = useCallback(async (settings) => {
    await api.updateLayoutSettings(settings)
    const data = await api.getLayoutSettings()
    setLayoutSettings(data)
  }, [api])

  const getPhotoSettings = useCallback(async (photoId) => {
    if (!photoId) return imageSettings || {}

    // Return cached if available
    if (photoImageSettings[photoId]) {
      return photoImageSettings[photoId]
    }

    // Return existing in-flight request if one exists
    if (pendingPhotoRequests.current[photoId]) {
      return pendingPhotoRequests.current[photoId]
    }

    // Fetch from API
    const request = (async () => {
      try {
        const data = await photoApi.getPhotoImageSettings(photoId)
        if (data) {
          setPhotoImageSettings(prev => ({ ...prev, [photoId]: data }))
          return data
        }
      } catch {
        // Fall through to global defaults on error (e.g. 404)
      } finally {
        delete pendingPhotoRequests.current[photoId]
      }

      // Fall back to global defaults
      return imageSettings || {}
    })()

    pendingPhotoRequests.current[photoId] = request
    return request
  }, [photoImageSettings, photoApi, imageSettings])

  const updatePhotoSettings = useCallback(async (photoId, settings) => {
    const data = await photoApi.updatePhotoImageSettings(photoId, settings)
    setPhotoImageSettings(prev => ({ ...prev, [photoId]: data }))
    return data
  }, [photoApi])

  const refreshPhotoSettings = useCallback(async (photoId) => {
    const data = await photoApi.getPhotoImageSettings(photoId)
    setPhotoImageSettings(prev => ({ ...prev, [photoId]: data }))
    return data
  }, [photoApi])

  const clearCache = useCallback(async () => {
    setLastRefresh(null)
    setPhotoImageSettings({})
    setLoading(true)
    try {
      const [pagesData, imgData, layoutData] = await Promise.all([
        api.getAllPages(),
        api.getImageSettings(),
        api.getLayoutSettings()
      ])
      setPages(pagesData)
      setImageSettings(imgData)
      setLayoutSettings(layoutData)
      setLastRefresh(Date.now())
    } finally {
      setLoading(false)
    }
  }, [api])

  return (
    <ContentContext.Provider
      value={{
        pages,
        currentPage,
        imageSettings,
        layoutSettings,
        photoImageSettings,
        loading,
        lastRefresh,
        refreshPages,
        selectPage,
        updatePage,
        refreshImageSettings,
        updateImageSettings,
        refreshLayoutSettings,
        updateLayoutSettings,
        getPhotoSettings,
        updatePhotoSettings,
        refreshPhotoSettings,
        clearCache
      }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}
