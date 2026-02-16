import { auth } from '@/lib/auth'
import { getSetting, upsertSetting } from '@/lib/admin-db'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

const DEFAULT_LAYOUT = {
  showHeader: true,
  showFooter: true,
  gridColumns: 3,
  colorScheme: 'light',
  navigationItems: [],
  componentStyles: {},
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session?.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const row = getSetting('layout')
    if (!row) {
      return Response.json(DEFAULT_LAYOUT)
    }

    try {
      return Response.json(JSON.parse(row.value))
    } catch {
      console.error('Malformed layout settings JSON in database')
      return Response.json(DEFAULT_LAYOUT)
    }
  } catch (err) {
    console.error('GET /api/admin/settings/layout error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session?.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ error: 'Invalid layout settings' }, { status: 400 })
    }
    if (body.gridColumns !== undefined && (!Number.isInteger(body.gridColumns) || body.gridColumns < 1 || body.gridColumns > 12)) {
      return Response.json({ error: 'gridColumns must be an integer between 1 and 12' }, { status: 400 })
    }
    if (body.colorScheme !== undefined && !['light', 'dark'].includes(body.colorScheme)) {
      return Response.json({ error: 'colorScheme must be "light" or "dark"' }, { status: 400 })
    }

    const existing = getSetting('layout')
    let current = DEFAULT_LAYOUT
    if (existing) {
      try {
        current = JSON.parse(existing.value)
      } catch {
        console.error('Malformed layout settings JSON in database, using defaults for merge')
      }
    }
    const merged = { ...current, ...body }
    upsertSetting('layout', JSON.stringify(merged))

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/settings/layout error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
