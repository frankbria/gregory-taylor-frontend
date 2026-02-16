import { auth } from '@/lib/auth'
import { getPage, upsertPage } from '@/lib/admin-db'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session?.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId } = await params
    const page = getPage(pageId)
    if (!page) {
      return Response.json({ error: 'Page not found' }, { status: 404 })
    }

    return Response.json({ ...page, _id: page.id, body: page.content })
  } catch (err) {
    console.error('GET /api/admin/pages/[pageId] error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session?.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId } = await params
    let data
    try {
      data = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const title = data.title
    const content = data.body ?? data.content
    if (typeof title !== 'string' || typeof content !== 'string') {
      return Response.json({ error: 'Missing or invalid title/content' }, { status: 400 })
    }
    upsertPage(pageId, title, content)

    return Response.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/pages/[pageId] error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
