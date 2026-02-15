/**
 * Tests for app/api/admin/settings/layout/route.js — GET/PUT layout config
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
global.Response = {
  json: (data, options) => ({
    json: async () => data,
    status: options?.status || 200,
  }),
}

import { GET, PUT } from '@/app/api/admin/settings/layout/route'
import { auth } from '@/lib/auth'
import { getSetting, upsertSetting } from '@/lib/admin-db'

const DEFAULT_LAYOUT = {
  showHeader: true,
  showFooter: true,
  gridColumns: 3,
  colorScheme: 'light',
  navigationItems: [],
  componentStyles: {},
}

describe('GET /api/admin/settings/layout', () => {
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

  it('should return default layout when no settings exist', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })
    getSetting.mockReturnValue(undefined)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(DEFAULT_LAYOUT)
    expect(getSetting).toHaveBeenCalledWith('layout')
  })

  it('should return stored layout settings', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })
    const layoutSettings = { ...DEFAULT_LAYOUT, gridColumns: 4, colorScheme: 'dark' }
    getSetting.mockReturnValue({ key: 'layout', value: JSON.stringify(layoutSettings) })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(layoutSettings)
  })
})

describe('PUT /api/admin/settings/layout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    auth.api.getSession.mockResolvedValue(null)

    const mockRequest = {
      json: async () => ({ gridColumns: 4 }),
    }

    const response = await PUT(mockRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should save layout settings and return success', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1' } })
    upsertSetting.mockReturnValue({ changes: 1 })

    const newLayout = { ...DEFAULT_LAYOUT, gridColumns: 4 }
    const mockRequest = {
      json: async () => newLayout,
    }

    const response = await PUT(mockRequest)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(upsertSetting).toHaveBeenCalledWith('layout', JSON.stringify(newLayout))
  })
})
