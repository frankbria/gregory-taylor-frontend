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

// Mock useAPI hook (default export from api.js) for per-photo functions
const mockPhotoApi = {
  getPhotos: jest.fn(),
  getPhotoImageSettings: jest.fn(),
  updatePhotoImageSettings: jest.fn()
}

jest.mock('../contentApi', () => ({
  __esModule: true,
  default: () => mockApi,
}))

jest.mock('../api', () => ({
  __esModule: true,
  default: () => mockPhotoApi,
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

  describe('per-photo image settings', () => {
    describe('getPhotoSettings', () => {
      it('should return cached settings when available', async () => {
        const mockSettings = { quality: 85, brightness: 10 }
        mockPhotoApi.getPhotoImageSettings.mockResolvedValueOnce(mockSettings)

        const { result } = renderHook(() => useContent(), { wrapper })

        // First call fetches from API
        let settings
        await act(async () => {
          settings = await result.current.getPhotoSettings('photo1')
        })

        expect(settings).toEqual(mockSettings)
        expect(mockPhotoApi.getPhotoImageSettings).toHaveBeenCalledWith('photo1')

        // Second call should use cache, not call API again
        let cachedSettings
        await act(async () => {
          cachedSettings = await result.current.getPhotoSettings('photo1')
        })

        expect(cachedSettings).toEqual(mockSettings)
        expect(mockPhotoApi.getPhotoImageSettings).toHaveBeenCalledTimes(1)
      })

      it('should fetch from API on cache miss', async () => {
        const mockSettings = { quality: 90, brightness: 5 }
        mockPhotoApi.getPhotoImageSettings.mockResolvedValueOnce(mockSettings)

        const { result } = renderHook(() => useContent(), { wrapper })

        let settings
        await act(async () => {
          settings = await result.current.getPhotoSettings('photo2')
        })

        expect(mockPhotoApi.getPhotoImageSettings).toHaveBeenCalledWith('photo2')
        expect(settings).toEqual(mockSettings)
      })

      it('should fall back to global defaults when API returns null', async () => {
        mockPhotoApi.getPhotoImageSettings.mockResolvedValueOnce(null)
        mockApi.getImageSettings.mockResolvedValueOnce({ defaultQuality: 80, defaultFormat: 'auto' })

        const { result } = renderHook(() => useContent(), { wrapper })

        // Load global image settings first
        await act(async () => {
          await result.current.refreshImageSettings()
        })

        let settings
        await act(async () => {
          settings = await result.current.getPhotoSettings('photo-missing')
        })

        expect(settings).toEqual({ defaultQuality: 80, defaultFormat: 'auto' })
      })

      it('should fall back to global defaults when API throws 404', async () => {
        mockPhotoApi.getPhotoImageSettings.mockRejectedValueOnce(new Error('Failed to fetch photo image settings: 404 Not Found'))
        mockApi.getImageSettings.mockResolvedValueOnce({ defaultQuality: 75 })

        const { result } = renderHook(() => useContent(), { wrapper })

        // Load global image settings first
        await act(async () => {
          await result.current.refreshImageSettings()
        })

        let settings
        await act(async () => {
          settings = await result.current.getPhotoSettings('photo-404')
        })

        expect(settings).toEqual({ defaultQuality: 75 })
      })
    })

    describe('updatePhotoSettings', () => {
      it('should call API and update cache', async () => {
        const mockUpdated = { quality: 95, brightness: 20 }
        mockPhotoApi.updatePhotoImageSettings.mockResolvedValueOnce(mockUpdated)

        const { result } = renderHook(() => useContent(), { wrapper })

        let updated
        await act(async () => {
          updated = await result.current.updatePhotoSettings('photo1', { quality: 95, brightness: 20 })
        })

        expect(mockPhotoApi.updatePhotoImageSettings).toHaveBeenCalledWith('photo1', { quality: 95, brightness: 20 })
        expect(updated).toEqual(mockUpdated)

        // Verify the cache was updated - should not call API again
        let cached
        await act(async () => {
          cached = await result.current.getPhotoSettings('photo1')
        })

        expect(cached).toEqual(mockUpdated)
        expect(mockPhotoApi.getPhotoImageSettings).not.toHaveBeenCalled()
      })
    })

    describe('refreshPhotoSettings', () => {
      it('should force refresh from API even if cached', async () => {
        const initialSettings = { quality: 80 }
        const refreshedSettings = { quality: 90 }

        mockPhotoApi.getPhotoImageSettings
          .mockResolvedValueOnce(initialSettings)
          .mockResolvedValueOnce(refreshedSettings)

        const { result } = renderHook(() => useContent(), { wrapper })

        // Initial fetch
        await act(async () => {
          await result.current.getPhotoSettings('photo1')
        })

        expect(mockPhotoApi.getPhotoImageSettings).toHaveBeenCalledTimes(1)

        // Force refresh
        let refreshed
        await act(async () => {
          refreshed = await result.current.refreshPhotoSettings('photo1')
        })

        expect(mockPhotoApi.getPhotoImageSettings).toHaveBeenCalledTimes(2)
        expect(refreshed).toEqual(refreshedSettings)

        // Subsequent call should use refreshed cache
        let cached
        await act(async () => {
          cached = await result.current.getPhotoSettings('photo1')
        })

        expect(cached).toEqual(refreshedSettings)
        expect(mockPhotoApi.getPhotoImageSettings).toHaveBeenCalledTimes(2)
      })
    })

    it('should expose photoImageSettings in context', () => {
      const { result } = renderHook(() => useContent(), { wrapper })

      expect(result.current.photoImageSettings).toEqual({})
    })
  })
})
