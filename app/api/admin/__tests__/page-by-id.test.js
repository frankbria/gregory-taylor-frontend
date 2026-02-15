/**
 * Tests for app/api/admin/pages/[pageId]/route.js — GET single page, PUT update
 */

jest.mock('better-sqlite3')
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))
jest.mock('@/lib/admin-db', () => ({
  getPage: jest.fn(),
  upsertPage: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}))

// Mock global Response.json for route handlers
global.Response = {
  json: (data, options) => ({
    json: async () => data,
    status: options?.status || 200,
  }),
}

import { GET, PUT } from '@/app/api/admin/pages/[pageId]/route'
import { auth } from '@/lib/auth'
import { getPage, upsertPage } from '@/lib/admin-db'

describe('GET /api/admin/pages/[pageId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const response = await GET(
      {},
      { params: Promise.resolve({ pageId: 'home' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return a page by id', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })
    const mockPage = { id: 'home', title: 'Home', content: '<p>Welcome</p>' }
    getPage.mockReturnValue(mockPage)

    const response = await GET(
      {},
      { params: Promise.resolve({ pageId: 'home' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockPage)
    expect(getPage).toHaveBeenCalledWith('home')
  })

  it('should return 404 when page not found', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })
    getPage.mockReturnValue(undefined)

    const response = await GET(
      {},
      { params: Promise.resolve({ pageId: 'nonexistent' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBeDefined()
  })
})

describe('PUT /api/admin/pages/[pageId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const mockRequest = {
      json: async () => ({ title: 'Home', content: '<p>Updated</p>' }),
    }

    const response = await PUT(
      mockRequest,
      { params: Promise.resolve({ pageId: 'home' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return 400 when title or content is missing', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })

    const mockRequest = {
      json: async () => ({ title: 123, content: null }),
    }

    const response = await PUT(
      mockRequest,
      { params: Promise.resolve({ pageId: 'home' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
    expect(upsertPage).not.toHaveBeenCalled()
  })

  it('should update a page and return success', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })
    upsertPage.mockReturnValue({ changes: 1 })

    const mockRequest = {
      json: async () => ({ title: 'Home Updated', content: '<p>New</p>' }),
    }

    const response = await PUT(
      mockRequest,
      { params: Promise.resolve({ pageId: 'home' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(upsertPage).toHaveBeenCalledWith('home', 'Home Updated', '<p>New</p>')
  })
})
