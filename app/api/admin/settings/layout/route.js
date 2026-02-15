import { auth } from '@/lib/auth'
import { getSetting, upsertSetting } from '@/lib/admin-db'
import { headers } from 'next/headers'

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
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const row = getSetting('layout')
    if (!row) {
      return Response.json(DEFAULT_LAYOUT)
    }

    return Response.json(JSON.parse(row.value))
  } catch (err) {
    console.error('GET /api/admin/settings/layout error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    upsertSetting('layout', JSON.stringify(body))

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/settings/layout error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
