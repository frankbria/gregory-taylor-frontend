import { auth } from '@/lib/auth'
import { getSetting, upsertSetting } from '@/lib/admin-db'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const row = getSetting('images')
    if (!row) {
      return Response.json({})
    }

    try {
      return Response.json(JSON.parse(row.value))
    } catch {
      console.error('Malformed image settings JSON in database')
      return Response.json({})
    }
  } catch (err) {
    console.error('GET /api/admin/settings/images error:', err)
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
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ error: 'Invalid image settings' }, { status: 400 })
    }
    upsertSetting('images', JSON.stringify(body))

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/settings/images error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
