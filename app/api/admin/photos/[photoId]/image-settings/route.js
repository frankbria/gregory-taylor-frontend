import { auth } from '@/lib/auth'
import { getPhotoSettings, upsertPhotoSettings } from '@/lib/admin-db'
import { headers } from 'next/headers'

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId } = await params
    const row = getPhotoSettings(photoId)
    if (!row) {
      return Response.json({})
    }

    return Response.json(JSON.parse(row.settings))
  } catch (err) {
    console.error('GET /api/admin/photos/[photoId]/image-settings error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId } = await params
    const body = await request.json()
    upsertPhotoSettings(photoId, JSON.stringify(body))

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/photos/[photoId]/image-settings error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
