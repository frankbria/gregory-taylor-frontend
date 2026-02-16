/**
 * Tests for app/api/admin/pages/route.js — GET all pages
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
  getAllPages: jest.fn(),
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

import { GET } from '@/app/api/admin/pages/route'
import { auth } from '@/lib/auth'
import { getAllPages } from '@/lib/admin-db'

describe('GET /api/admin/pages', () => {
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

  it('should return 401 when authenticated but not admin', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'user' } })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('should return all pages when authenticated', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    const mockPages = [
      { id: 'home', title: 'Home', content: '<p>Welcome</p>' },
      { id: 'about', title: 'About', content: '<p>About us</p>' },
    ]
    getAllPages.mockReturnValue(mockPages)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockPages.map(p => ({ ...p, _id: p.id })))
  })

  it('should return empty array when no pages exist', async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: '1', role: 'admin' } })
    getAllPages.mockReturnValue([])

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual([])
  })
})
