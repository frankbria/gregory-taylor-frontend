/**
 * Tests for app/api/admin/settings/images/route.js — GET/PUT global image defaults
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
  getSetting: jest.fn(),
  upsertSetting: jest.fn(),
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

import { GET, PUT } from '@/app/api/admin/settings/images/route'
import { auth } from '@/lib/auth'
import { getSetting, upsertSetting } from '@/lib/admin-db'

describe('GET /api/admin/settings/images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return empty object when no image settings exist', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    getSetting.mockReturnValue(undefined)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({})
    expect(getSetting).toHaveBeenCalledWith('images')
  })

  it('should return stored image settings', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    const imageSettings = { quality: 80, format: 'auto' }
    getSetting.mockReturnValue({ key: 'images', value: JSON.stringify(imageSettings) })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(imageSettings)
  })
})

describe('PUT /api/admin/settings/images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const mockRequest = {
      json: async () => ({ quality: 90 }),
    }

    const response = await PUT(mockRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return 400 for non-object body', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })

    const mockRequest = { json: async () => 'not-an-object' }
    const response = await PUT(mockRequest)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
    expect(upsertSetting).not.toHaveBeenCalled()
  })

  it('should save image settings and return success', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    upsertSetting.mockReturnValue({ changes: 1 })

    const newSettings = { quality: 90, format: 'webp' }
    const mockRequest = {
      json: async () => newSettings,
    }

    const response = await PUT(mockRequest)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(upsertSetting).toHaveBeenCalledWith('images', JSON.stringify(newSettings))
  })
})
