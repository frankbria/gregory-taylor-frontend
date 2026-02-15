import { auth } from '@/lib/auth'
import { getPage, upsertPage } from '@/lib/admin-db'
import { headers } from 'next/headers'

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId } = await params
    const page = getPage(pageId)
    if (!page) {
      return Response.json({ error: 'Page not found' }, { status: 404 })
    }

    return Response.json(page)
  } catch (err) {
    console.error('GET /api/admin/pages/[pageId] error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId } = await params
    const { title, content } = await request.json()
    upsertPage(pageId, title, content)

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/pages/[pageId] error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
