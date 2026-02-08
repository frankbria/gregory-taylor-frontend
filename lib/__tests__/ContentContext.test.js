import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ContentProvider, useContent } from '../ContentContext'

// Mock the contentApi standalone exports
jest.mock('../contentApi', () => ({
  __esModule: true,
  default: jest.fn(),
  getAllPages: jest.fn(),
  getPageContent: jest.fn(),
  updatePageContent: jest.fn(),
  getImageSettings: jest.fn(),
  updateImageSettings: jest.fn(),
  getLayoutSettings: jest.fn(),
  updateLayoutSettings: jest.fn()
}))

import {
  getAllPages,
  getPageContent,
  updatePageContent,
  getImageSettings,
  updateImageSettings as updateImageSettingsApi,
  getLayoutSettings,
  updateLayoutSettings as updateLayoutSettingsApi
} from '../contentApi'

const wrapper = ({ children }) => <ContentProvider>{children}</ContentProvider>

describe('ContentContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useContent hook', () => {
    it('should throw error when used outside ContentProvider', () => {
      // Suppress console.error for expected error
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useContent())
      }).toThrow('useContent must be used within a ContentProvider')

      spy.mockRestore()
    })

    it('should provide initial state values', () => {
      const { result } = renderHook(() => useContent(), { wrapper })

      expect(result.current.pages).toEqual([])
      expect(result.current.currentPage).toBeNull()
      expect(result.current.imageSettings).toBeNull()
      expect(result.current.layoutSettings).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.lastRefresh).toBeNull()
    })
  })

  describe('refreshPages', () => {
    it('should fetch pages and update state', async () => {
      const mockPages = [
        { _id: 'page1', title: 'Home' },
        { _id: 'page2', title: 'About' }
      ]
      getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(getAllPages).toHaveBeenCalled()
      expect(result.current.pages).toEqual(mockPages)
      expect(result.current.loading).toBe(false)
    })

    it('should set loading during fetch', async () => {
      let resolvePages
      getAllPages.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePages = resolve
        })
      )

      const { result } = renderHook(() => useContent(), { wrapper })

      let refreshPromise
      act(() => {
        refreshPromise = result.current.refreshPages()
      })

      // loading should be true while fetching
      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePages([])
        await refreshPromise
      })

      expect(result.current.loading).toBe(false)
    })

    it('should skip fetch if cache is fresh (within 5 min TTL)', async () => {
      const mockPages = [{ _id: 'page1', title: 'Home' }]
      getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      // First call - should fetch
      await act(async () => {
        await result.current.refreshPages()
      })

      expect(getAllPages).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      await act(async () => {
        await result.current.refreshPages()
      })

      expect(getAllPages).toHaveBeenCalledTimes(1)
    })

    it('should handle API error gracefully', async () => {
      getAllPages.mockRejectedValueOnce(new Error('API error'))
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(result.current.pages).toEqual([])
      expect(result.current.loading).toBe(false)

      spy.mockRestore()
    })
  })

  describe('selectPage', () => {
    it('should fetch and set the current page', async () => {
      const mockPage = { _id: 'page1', title: 'Home', content: { hero: 'Welcome' } }
      getPageContent.mockResolvedValueOnce(mockPage)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.selectPage('page1')
      })

      expect(getPageContent).toHaveBeenCalledWith('page1')
      expect(result.current.currentPage).toEqual(mockPage)
    })

    it('should handle error when selecting page', async () => {
      getPageContent.mockRejectedValueOnce(new Error('Not found'))
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.selectPage('missing')
      })

      expect(result.current.currentPage).toBeNull()

      spy.mockRestore()
    })
  })

  describe('updatePage', () => {
    it('should update page and refresh pages list', async () => {
      const mockUpdated = { _id: 'page1', content: { hero: 'Updated' } }
      const mockPages = [mockUpdated]
      updatePageContent.mockResolvedValueOnce(mockUpdated)
      getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updatePage('page1', { hero: 'Updated' })
      })

      expect(updatePageContent).toHaveBeenCalledWith('page1', { hero: 'Updated' })
      expect(getAllPages).toHaveBeenCalled()
      expect(result.current.pages).toEqual(mockPages)
    })

    it('should handle error during page update', async () => {
      updatePageContent.mockRejectedValueOnce(new Error('Update failed'))
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updatePage('page1', { hero: 'bad' })
      })

      expect(result.current.loading).toBe(false)

      spy.mockRestore()
    })
  })

  describe('refreshImageSettings', () => {
    it('should fetch and update image settings', async () => {
      const mockSettings = { maxWidth: 1920, quality: 85 }
      getImageSettings.mockResolvedValueOnce(mockSettings)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshImageSettings()
      })

      expect(getImageSettings).toHaveBeenCalled()
      expect(result.current.imageSettings).toEqual(mockSettings)
    })

    it('should handle error gracefully', async () => {
      getImageSettings.mockRejectedValueOnce(new Error('API error'))
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshImageSettings()
      })

      expect(result.current.imageSettings).toBeNull()

      spy.mockRestore()
    })
  })

  describe('updateImageSettings', () => {
    it('should update and refresh image settings', async () => {
      const mockUpdated = { maxWidth: 2048, quality: 90 }
      updateImageSettingsApi.mockResolvedValueOnce(mockUpdated)
      getImageSettings.mockResolvedValueOnce(mockUpdated)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updateImageSettings({ maxWidth: 2048, quality: 90 })
      })

      expect(updateImageSettingsApi).toHaveBeenCalledWith({ maxWidth: 2048, quality: 90 })
      expect(getImageSettings).toHaveBeenCalled()
      expect(result.current.imageSettings).toEqual(mockUpdated)
    })
  })

  describe('refreshLayoutSettings', () => {
    it('should fetch and update layout settings', async () => {
      const mockLayout = { columns: 3, spacing: 'normal' }
      getLayoutSettings.mockResolvedValueOnce(mockLayout)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshLayoutSettings()
      })

      expect(getLayoutSettings).toHaveBeenCalled()
      expect(result.current.layoutSettings).toEqual(mockLayout)
    })

    it('should handle error gracefully', async () => {
      getLayoutSettings.mockRejectedValueOnce(new Error('API error'))
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshLayoutSettings()
      })

      expect(result.current.layoutSettings).toBeNull()

      spy.mockRestore()
    })
  })

  describe('updateLayoutSettings', () => {
    it('should update and refresh layout settings', async () => {
      const mockUpdated = { columns: 4, spacing: 'wide' }
      updateLayoutSettingsApi.mockResolvedValueOnce(mockUpdated)
      getLayoutSettings.mockResolvedValueOnce(mockUpdated)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updateLayoutSettings({ columns: 4, spacing: 'wide' })
      })

      expect(updateLayoutSettingsApi).toHaveBeenCalledWith({ columns: 4, spacing: 'wide' })
      expect(getLayoutSettings).toHaveBeenCalled()
      expect(result.current.layoutSettings).toEqual(mockUpdated)
    })
  })

  describe('clearCache', () => {
    it('should reset lastRefresh and refetch all data', async () => {
      const mockPages = [{ _id: 'page1', title: 'Home' }]
      const mockImageSettings = { maxWidth: 1920 }
      const mockLayoutSettings = { columns: 3 }

      // First call to populate cache
      getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(getAllPages).toHaveBeenCalledTimes(1)

      // Set up mocks for refetch after cache clear
      getAllPages.mockResolvedValueOnce(mockPages)
      getImageSettings.mockResolvedValueOnce(mockImageSettings)
      getLayoutSettings.mockResolvedValueOnce(mockLayoutSettings)

      // Clear cache and refetch
      await act(async () => {
        await result.current.clearCache()
      })

      // Should have called getAllPages again after cache clear
      expect(getAllPages).toHaveBeenCalledTimes(2)
      expect(getImageSettings).toHaveBeenCalled()
      expect(getLayoutSettings).toHaveBeenCalled()
    })
  })
})
