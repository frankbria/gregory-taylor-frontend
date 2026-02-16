import { auth } from '@/lib/auth'
import { getPhotoSettings, upsertPhotoSettings } from '@/lib/admin-db'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session?.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId } = await params
    const row = getPhotoSettings(photoId)
    if (!row) {
      return Response.json({})
    }

    try {
      return Response.json(JSON.parse(row.settings))
    } catch {
      console.error(`Malformed photo settings JSON for photoId: ${photoId}`)
      return Response.json({})
    }
  } catch (err) {
    console.error('GET /api/admin/photos/[photoId]/image-settings error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session?.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId } = await params
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ error: 'Invalid photo settings' }, { status: 400 })
    }
    upsertPhotoSettings(photoId, JSON.stringify(body))

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/photos/[photoId]/image-settings error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
