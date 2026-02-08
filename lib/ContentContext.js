'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import {
  getAllPages as fetchAllPages,
  getPageContent as fetchPageContent,
  updatePageContent as apiUpdatePageContent,
  getImageSettings as fetchImageSettings,
  updateImageSettings as apiUpdateImageSettings,
  getLayoutSettings as fetchLayoutSettings,
  updateLayoutSettings as apiUpdateLayoutSettings
} from './contentApi'

const ContentContext = createContext()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function ContentProvider({ children }) {
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const [imageSettings, setImageSettings] = useState(null)
  const [layoutSettings, setLayoutSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const isCacheFresh = useCallback(() => {
    if (!lastRefresh) return false
    return Date.now() - lastRefresh < CACHE_TTL
  }, [lastRefresh])

  const refreshPages = useCallback(async () => {
    if (isCacheFresh()) return

    setLoading(true)
    try {
      const data = await fetchAllPages()
      setPages(data)
      setLastRefresh(Date.now())
    } catch (error) {
      console.error('Failed to refresh pages:', error)
    } finally {
      setLoading(false)
    }
  }, [isCacheFresh])

  const selectPage = useCallback(async (pageId) => {
    try {
      const page = await fetchPageContent(pageId)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to select page:', error)
    }
  }, [])

  const updatePage = useCallback(async (pageId, content) => {
    setLoading(true)
    try {
      await apiUpdatePageContent(pageId, content)
      // Force refresh by clearing cache
      setLastRefresh(null)
      const data = await fetchAllPages()
      setPages(data)
      setLastRefresh(Date.now())
    } catch (error) {
      console.error('Failed to update page:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshImageSettings = useCallback(async () => {
    try {
      const data = await fetchImageSettings()
      setImageSettings(data)
    } catch (error) {
      console.error('Failed to refresh image settings:', error)
    }
  }, [])

  const updateImageSettings = useCallback(async (settings) => {
    try {
      await apiUpdateImageSettings(settings)
      const data = await fetchImageSettings()
      setImageSettings(data)
    } catch (error) {
      console.error('Failed to update image settings:', error)
    }
  }, [])

  const refreshLayoutSettings = useCallback(async () => {
    try {
      const data = await fetchLayoutSettings()
      setLayoutSettings(data)
    } catch (error) {
      console.error('Failed to refresh layout settings:', error)
    }
  }, [])

  const updateLayoutSettings = useCallback(async (settings) => {
    try {
      await apiUpdateLayoutSettings(settings)
      const data = await fetchLayoutSettings()
      setLayoutSettings(data)
    } catch (error) {
      console.error('Failed to update layout settings:', error)
    }
  }, [])

  const clearCache = useCallback(async () => {
    setLastRefresh(null)
    setLoading(true)
    try {
      const [pagesData, imgData, layoutData] = await Promise.all([
        fetchAllPages(),
        fetchImageSettings(),
        fetchLayoutSettings()
      ])
      setPages(pagesData)
      setImageSettings(imgData)
      setLayoutSettings(layoutData)
      setLastRefresh(Date.now())
    } catch (error) {
      console.error('Failed to clear cache and refetch:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <ContentContext.Provider
      value={{
        pages,
        currentPage,
        imageSettings,
        layoutSettings,
        loading,
        lastRefresh,
        refreshPages,
        selectPage,
        updatePage,
        refreshImageSettings,
        updateImageSettings,
        refreshLayoutSettings,
        updateLayoutSettings,
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
