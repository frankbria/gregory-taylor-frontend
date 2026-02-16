/**
 * Tests for app/api/admin/photos/[photoId]/image-settings/route.js — GET/PUT per-photo overrides
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
  getPhotoSettings: jest.fn(),
  upsertPhotoSettings: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}))

// Mock global Response.json for route handlers
const originalResponse = global.Response
global.Response = {
  json: (data, options) => ({
    json: async () => data,
    status: options?.status || 200,
  }),
}

afterAll(() => {
  global.Response = originalResponse
})

import { GET, PUT } from '@/app/api/admin/photos/[photoId]/image-settings/route'
import { auth } from '@/lib/auth'
import { getPhotoSettings, upsertPhotoSettings } from '@/lib/admin-db'

describe('GET /api/admin/photos/[photoId]/image-settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const response = await GET(
      {},
      { params: Promise.resolve({ photoId: 'photo-1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return empty object when no settings exist for photo', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    getPhotoSettings.mockReturnValue(undefined)

    const response = await GET(
      {},
      { params: Promise.resolve({ photoId: 'photo-1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({})
    expect(getPhotoSettings).toHaveBeenCalledWith('photo-1')
  })

  it('should return stored photo settings', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    const settings = { quality: 85, sharpen: true }
    getPhotoSettings.mockReturnValue({ photoId: 'photo-1', settings: JSON.stringify(settings) })

    const response = await GET(
      {},
      { params: Promise.resolve({ photoId: 'photo-1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(settings)
  })
})

describe('PUT /api/admin/photos/[photoId]/image-settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const mockRequest = {
      json: async () => ({ quality: 90 }),
    }

    const response = await PUT(
      mockRequest,
      { params: Promise.resolve({ photoId: 'photo-1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return 400 for non-object body', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })

    const mockRequest = { json: async () => [1, 2, 3] }
    const response = await PUT(
      mockRequest,
      { params: Promise.resolve({ photoId: 'photo-1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
    expect(upsertPhotoSettings).not.toHaveBeenCalled()
  })

  it('should save photo settings and return success', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    upsertPhotoSettings.mockReturnValue({ changes: 1 })

    const newSettings = { quality: 90, blur: 5 }
    const mockRequest = {
      json: async () => newSettings,
    }

    const response = await PUT(
      mockRequest,
      { params: Promise.resolve({ photoId: 'photo-1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(upsertPhotoSettings).toHaveBeenCalledWith('photo-1', JSON.stringify(newSettings))
  })
})
