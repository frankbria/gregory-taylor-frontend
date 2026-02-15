import { auth } from '@/lib/auth'
import { getAllPages } from '@/lib/admin-db'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pages = getAllPages()
    return Response.json(pages)
  } catch (err) {
    console.error('GET /api/admin/pages error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
