import { renderHook, act } from '@testing-library/react'
import useContentAPI from '../contentApi'
import { useError } from '../ErrorContext'

// Mock dependencies
jest.mock('../ErrorContext')

// Mock fetch
global.fetch = jest.fn()

describe('useContentAPI Hook', () => {
  const mockHandleApiError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useError.mockReturnValue({
      handleApiError: mockHandleApiError
    })
  })

  describe('getAllPages', () => {
    const mockPages = [
      { _id: 'page1', title: 'Home', slug: 'home' },
      { _id: 'page2', title: 'About', slug: 'about' }
    ]

    it('should fetch all pages successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPages
      })

      const { result } = renderHook(() => useContentAPI())

      let pages
      await act(async () => {
        pages = await result.current.getAllPages()
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/pages')
      expect(pages).toEqual(mockPages)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getAllPages()).rejects.toThrow(
          'Failed to fetch pages: 500 Internal Server Error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getAllPages'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getAllPages()).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getAllPages'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getAllPages()).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getAllPages'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('getPageContent', () => {
    const mockPage = { _id: 'page1', title: 'Home', content: { hero: 'Welcome' } }

    it('should fetch page content by id', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPage
      })

      const { result } = renderHook(() => useContentAPI())

      let page
      await act(async () => {
        page = await result.current.getPageContent('page1')
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/pages/page1')
      expect(page).toEqual(mockPage)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getPageContent('missing')).rejects.toThrow(
          'Failed to fetch page content: 404 Not Found'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getPageContent'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getPageContent('page1')).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getPageContent'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getPageContent('page1')).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getPageContent'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('updatePageContent', () => {
    const mockUpdatedPage = { _id: 'page1', title: 'Home', content: { hero: 'Updated' } }

    it('should update page content successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedPage
      })

      const { result } = renderHook(() => useContentAPI())

      let updated
      await act(async () => {
        updated = await result.current.updatePageContent('page1', { hero: 'Updated' })
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/pages/page1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: 'Updated' })
      })
      expect(updated).toEqual(mockUpdatedPage)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updatePageContent('page1', { hero: 'bad' })
        ).rejects.toThrow('Failed to update page content: 400 Bad Request')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updatePageContent'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updatePageContent('page1', { hero: 'test' })
        ).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'updatePageContent'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updatePageContent('page1', { hero: 'test' })
        ).rejects.toThrow('API base URL is not defined')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updatePageContent'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('getImageSettings', () => {
    const mockSettings = { maxWidth: 1920, quality: 85 }

    it('should fetch image settings successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings
      })

      const { result } = renderHook(() => useContentAPI())

      let settings
      await act(async () => {
        settings = await result.current.getImageSettings()
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/images')
      expect(settings).toEqual(mockSettings)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getImageSettings()).rejects.toThrow(
          'Failed to fetch image settings: 500 Internal Server Error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getImageSettings'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getImageSettings()).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getImageSettings'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getImageSettings()).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getImageSettings'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('updateImageSettings', () => {
    const mockUpdatedSettings = { maxWidth: 2048, quality: 90 }

    it('should update image settings successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedSettings
      })

      const { result } = renderHook(() => useContentAPI())

      let settings
      await act(async () => {
        settings = await result.current.updateImageSettings({ maxWidth: 2048, quality: 90 })
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxWidth: 2048, quality: 90 })
      })
      expect(settings).toEqual(mockUpdatedSettings)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updateImageSettings({ maxWidth: -1 })
        ).rejects.toThrow('Failed to update image settings: 400 Bad Request')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updateImageSettings'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updateImageSettings({ maxWidth: 2048 })
        ).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'updateImageSettings'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updateImageSettings({ maxWidth: 2048 })
        ).rejects.toThrow('API base URL is not defined')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updateImageSettings'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('getLayoutSettings', () => {
    const mockLayout = { columns: 3, spacing: 'normal' }

    it('should fetch layout settings successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLayout
      })

      const { result } = renderHook(() => useContentAPI())

      let settings
      await act(async () => {
        settings = await result.current.getLayoutSettings()
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/layout')
      expect(settings).toEqual(mockLayout)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getLayoutSettings()).rejects.toThrow(
          'Failed to fetch layout settings: 500 Internal Server Error'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getLayoutSettings'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getLayoutSettings()).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'getLayoutSettings'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(result.current.getLayoutSettings()).rejects.toThrow(
          'API base URL is not defined'
        )
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'getLayoutSettings'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('updateLayoutSettings', () => {
    const mockUpdatedLayout = { columns: 4, spacing: 'wide' }

    it('should update layout settings successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedLayout
      })

      const { result } = renderHook(() => useContentAPI())

      let settings
      await act(async () => {
        settings = await result.current.updateLayoutSettings({ columns: 4, spacing: 'wide' })
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: 4, spacing: 'wide' })
      })
      expect(settings).toEqual(mockUpdatedLayout)
    })

    it('should handle API error response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updateLayoutSettings({ columns: -1 })
        ).rejects.toThrow('Failed to update layout settings: 400 Bad Request')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updateLayoutSettings'
      )
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network error')
      global.fetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updateLayoutSettings({ columns: 4 })
        ).rejects.toThrow('Network error')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        networkError,
        'updateLayoutSettings'
      )
    })

    it('should throw error when API base URL is not defined', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const { result } = renderHook(() => useContentAPI())

      await act(async () => {
        await expect(
          result.current.updateLayoutSettings({ columns: 4 })
        ).rejects.toThrow('API base URL is not defined')
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        'updateLayoutSettings'
      )

      process.env.NEXT_PUBLIC_API_BASE = originalEnv
    })
  })

  describe('getPublicPageContent', () => {
    it('should fetch public page content successfully', async () => {
      const mockData = { sections: [{ sectionId: 'hero', content: '<p>Hello</p>' }] }
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const { result } = renderHook(() => useContentAPI())

      let data
      await act(async () => {
        data = await result.current.getPublicPageContent('home')
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/pages/home')
      expect(data).toEqual(mockData)
    })

    it('should return null on failure', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })

      const { result } = renderHook(() => useContentAPI())

      let data
      await act(async () => {
        data = await result.current.getPublicPageContent('missing')
      })

      expect(data).toBeNull()
    })

    it('should return null when no pageId', async () => {
      const { result } = renderHook(() => useContentAPI())

      let data
      await act(async () => {
        data = await result.current.getPublicPageContent(null)
      })

      expect(data).toBeNull()
    })

    it('should return null on network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useContentAPI())

      let data
      await act(async () => {
        data = await result.current.getPublicPageContent('home')
      })

      expect(data).toBeNull()
    })
  })
})

// Tests for standalone exports (backward compatibility)
describe('Standalone contentApi exports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllPages (standalone)', () => {
    it('should fetch all pages', async () => {
      const { getAllPages } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ _id: '1', title: 'Home' }]
      })

      const result = await getAllPages()
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/pages')
      expect(result).toEqual([{ _id: '1', title: 'Home' }])
    })

    it('should throw when base URL missing', async () => {
      const { getAllPages } = await import('../contentApi')
      const original = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      await expect(getAllPages()).rejects.toThrow('API base URL is not defined')
      process.env.NEXT_PUBLIC_API_BASE = original
    })

    it('should throw on non-ok response', async () => {
      const { getAllPages } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })

      await expect(getAllPages()).rejects.toThrow('Failed to fetch pages')
    })
  })

  describe('getPageContent (standalone)', () => {
    it('should fetch page content by id', async () => {
      const { getPageContent } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: '1', title: 'Home' })
      })

      const result = await getPageContent('1')
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/pages/1')
      expect(result).toEqual({ _id: '1', title: 'Home' })
    })

    it('should throw on non-ok response', async () => {
      const { getPageContent } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })

      await expect(getPageContent('1')).rejects.toThrow('Failed to fetch page content')
    })
  })

  describe('updatePageContent (standalone)', () => {
    it('should update page content', async () => {
      const { updatePageContent } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: '1', title: 'Updated' })
      })

      const result = await updatePageContent('1', { title: 'Updated' })
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/pages/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' })
      })
      expect(result).toEqual({ _id: '1', title: 'Updated' })
    })

    it('should throw on non-ok response', async () => {
      const { updatePageContent } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' })

      await expect(updatePageContent('1', {})).rejects.toThrow('Failed to update page content')
    })
  })

  describe('getImageSettings (standalone)', () => {
    it('should fetch image settings', async () => {
      const { getImageSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ quality: 85 })
      })

      const result = await getImageSettings()
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/images')
      expect(result).toEqual({ quality: 85 })
    })

    it('should throw on non-ok response', async () => {
      const { getImageSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })

      await expect(getImageSettings()).rejects.toThrow('Failed to fetch image settings')
    })
  })

  describe('updateImageSettings (standalone)', () => {
    it('should update image settings', async () => {
      const { updateImageSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ quality: 90 })
      })

      const result = await updateImageSettings({ quality: 90 })
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: 90 })
      })
      expect(result).toEqual({ quality: 90 })
    })

    it('should throw on non-ok response', async () => {
      const { updateImageSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' })

      await expect(updateImageSettings({})).rejects.toThrow('Failed to update image settings')
    })
  })

  describe('getLayoutSettings (standalone)', () => {
    it('should fetch layout settings', async () => {
      const { getLayoutSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ columns: 3 })
      })

      const result = await getLayoutSettings()
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/layout')
      expect(result).toEqual({ columns: 3 })
    })

    it('should throw on non-ok response', async () => {
      const { getLayoutSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })

      await expect(getLayoutSettings()).rejects.toThrow('Failed to fetch layout settings')
    })
  })

  describe('updateLayoutSettings (standalone)', () => {
    it('should update layout settings', async () => {
      const { updateLayoutSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ columns: 4 })
      })

      const result = await updateLayoutSettings({ columns: 4 })
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/settings/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: 4 })
      })
      expect(result).toEqual({ columns: 4 })
    })

    it('should throw on non-ok response', async () => {
      const { updateLayoutSettings } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' })

      await expect(updateLayoutSettings({})).rejects.toThrow('Failed to update layout settings')
    })
  })

  describe('getPublicPageContent (standalone)', () => {
    it('should fetch public page content on success', async () => {
      const { getPublicPageContent } = await import('../contentApi')
      const mockData = { sections: [{ sectionId: 'hero', content: '<p>Hello</p>' }] }
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const result = await getPublicPageContent('home')
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/pages/home')
      expect(result).toEqual(mockData)
    })

    it('should return null on API failure', async () => {
      const { getPublicPageContent } = await import('../contentApi')
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })

      const result = await getPublicPageContent('home')
      expect(result).toBeNull()
    })

    it('should return null when no pageId provided', async () => {
      const { getPublicPageContent } = await import('../contentApi')

      const result = await getPublicPageContent(null)
      expect(result).toBeNull()
    })

    it('should return null on network error', async () => {
      const { getPublicPageContent } = await import('../contentApi')
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await getPublicPageContent('home')
      expect(result).toBeNull()
    })

    it('should return null when API base URL is not defined', async () => {
      const { getPublicPageContent } = await import('../contentApi')
      const original = process.env.NEXT_PUBLIC_API_BASE
      delete process.env.NEXT_PUBLIC_API_BASE

      const result = await getPublicPageContent('home')
      expect(result).toBeNull()

      process.env.NEXT_PUBLIC_API_BASE = original
    })
  })
})
