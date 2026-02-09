import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { ContentProvider, useContent } from '../ContentContext'

// Mock useContentAPI hook (default export) to return our mock API methods
const mockApi = {
  getAllPages: jest.fn(),
  getPageContent: jest.fn(),
  updatePageContent: jest.fn(),
  getImageSettings: jest.fn(),
  updateImageSettings: jest.fn(),
  getLayoutSettings: jest.fn(),
  updateLayoutSettings: jest.fn()
}

jest.mock('../contentApi', () => ({
  __esModule: true,
  default: () => mockApi,
}))

const wrapper = ({ children }) => <ContentProvider>{children}</ContentProvider>

describe('ContentContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useContent hook', () => {
    it('should throw error when used outside ContentProvider', () => {
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
      mockApi.getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(mockApi.getAllPages).toHaveBeenCalled()
      expect(result.current.pages).toEqual(mockPages)
      expect(result.current.loading).toBe(false)
    })

    it('should set loading during fetch', async () => {
      let resolvePages
      mockApi.getAllPages.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePages = resolve
        })
      )

      const { result } = renderHook(() => useContent(), { wrapper })

      let refreshPromise
      act(() => {
        refreshPromise = result.current.refreshPages()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePages([])
        await refreshPromise
      })

      expect(result.current.loading).toBe(false)
    })

    it('should skip fetch if cache is fresh (within 5 min TTL)', async () => {
      const mockPages = [{ _id: 'page1', title: 'Home' }]
      mockApi.getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(mockApi.getAllPages).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(mockApi.getAllPages).toHaveBeenCalledTimes(1)
    })

    it('should propagate API error and reset loading', async () => {
      mockApi.getAllPages.mockRejectedValueOnce(new Error('API error'))

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await expect(result.current.refreshPages()).rejects.toThrow('API error')
      })

      expect(result.current.pages).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('selectPage', () => {
    it('should fetch and set the current page', async () => {
      const mockPage = { _id: 'page1', title: 'Home', content: { hero: 'Welcome' } }
      mockApi.getPageContent.mockResolvedValueOnce(mockPage)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.selectPage('page1')
      })

      expect(mockApi.getPageContent).toHaveBeenCalledWith('page1')
      expect(result.current.currentPage).toEqual(mockPage)
    })

    it('should propagate error when selecting page', async () => {
      mockApi.getPageContent.mockRejectedValueOnce(new Error('Not found'))

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await expect(result.current.selectPage('missing')).rejects.toThrow('Not found')
      })

      expect(result.current.currentPage).toBeNull()
    })
  })

  describe('updatePage', () => {
    it('should update page and refresh pages list', async () => {
      const mockUpdated = { _id: 'page1', content: { hero: 'Updated' } }
      const mockPages = [mockUpdated]
      mockApi.updatePageContent.mockResolvedValueOnce(mockUpdated)
      mockApi.getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updatePage('page1', { hero: 'Updated' })
      })

      expect(mockApi.updatePageContent).toHaveBeenCalledWith('page1', { hero: 'Updated' })
      expect(mockApi.getAllPages).toHaveBeenCalled()
      expect(result.current.pages).toEqual(mockPages)
    })

    it('should propagate error during page update and reset loading', async () => {
      mockApi.updatePageContent.mockRejectedValueOnce(new Error('Update failed'))

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await expect(result.current.updatePage('page1', { hero: 'bad' })).rejects.toThrow('Update failed')
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('refreshImageSettings', () => {
    it('should fetch and update image settings', async () => {
      const mockSettings = { maxWidth: 1920, quality: 85 }
      mockApi.getImageSettings.mockResolvedValueOnce(mockSettings)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshImageSettings()
      })

      expect(mockApi.getImageSettings).toHaveBeenCalled()
      expect(result.current.imageSettings).toEqual(mockSettings)
    })

    it('should propagate error', async () => {
      mockApi.getImageSettings.mockRejectedValueOnce(new Error('API error'))

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await expect(result.current.refreshImageSettings()).rejects.toThrow('API error')
      })

      expect(result.current.imageSettings).toBeNull()
    })
  })

  describe('updateImageSettings', () => {
    it('should update and refresh image settings', async () => {
      const mockUpdated = { maxWidth: 2048, quality: 90 }
      mockApi.updateImageSettings.mockResolvedValueOnce(mockUpdated)
      mockApi.getImageSettings.mockResolvedValueOnce(mockUpdated)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updateImageSettings({ maxWidth: 2048, quality: 90 })
      })

      expect(mockApi.updateImageSettings).toHaveBeenCalledWith({ maxWidth: 2048, quality: 90 })
      expect(mockApi.getImageSettings).toHaveBeenCalled()
      expect(result.current.imageSettings).toEqual(mockUpdated)
    })
  })

  describe('refreshLayoutSettings', () => {
    it('should fetch and update layout settings', async () => {
      const mockLayout = { columns: 3, spacing: 'normal' }
      mockApi.getLayoutSettings.mockResolvedValueOnce(mockLayout)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshLayoutSettings()
      })

      expect(mockApi.getLayoutSettings).toHaveBeenCalled()
      expect(result.current.layoutSettings).toEqual(mockLayout)
    })

    it('should propagate error', async () => {
      mockApi.getLayoutSettings.mockRejectedValueOnce(new Error('API error'))

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await expect(result.current.refreshLayoutSettings()).rejects.toThrow('API error')
      })

      expect(result.current.layoutSettings).toBeNull()
    })
  })

  describe('updateLayoutSettings', () => {
    it('should update and refresh layout settings', async () => {
      const mockUpdated = { columns: 4, spacing: 'wide' }
      mockApi.updateLayoutSettings.mockResolvedValueOnce(mockUpdated)
      mockApi.getLayoutSettings.mockResolvedValueOnce(mockUpdated)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.updateLayoutSettings({ columns: 4, spacing: 'wide' })
      })

      expect(mockApi.updateLayoutSettings).toHaveBeenCalledWith({ columns: 4, spacing: 'wide' })
      expect(mockApi.getLayoutSettings).toHaveBeenCalled()
      expect(result.current.layoutSettings).toEqual(mockUpdated)
    })
  })

  describe('clearCache', () => {
    it('should reset lastRefresh and refetch all data', async () => {
      const mockPages = [{ _id: 'page1', title: 'Home' }]
      const mockImageSettings = { maxWidth: 1920 }
      const mockLayoutSettings = { columns: 3 }

      // First call to populate cache
      mockApi.getAllPages.mockResolvedValueOnce(mockPages)

      const { result } = renderHook(() => useContent(), { wrapper })

      await act(async () => {
        await result.current.refreshPages()
      })

      expect(mockApi.getAllPages).toHaveBeenCalledTimes(1)

      // Set up mocks for refetch after cache clear
      mockApi.getAllPages.mockResolvedValueOnce(mockPages)
      mockApi.getImageSettings.mockResolvedValueOnce(mockImageSettings)
      mockApi.getLayoutSettings.mockResolvedValueOnce(mockLayoutSettings)

      // Clear cache and refetch
      await act(async () => {
        await result.current.clearCache()
      })

      expect(mockApi.getAllPages).toHaveBeenCalledTimes(2)
      expect(mockApi.getImageSettings).toHaveBeenCalled()
      expect(mockApi.getLayoutSettings).toHaveBeenCalled()
    })
  })
})
