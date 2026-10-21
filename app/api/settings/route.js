import { get, set } from '@/lib/db'
import { session } from '@/lib/auth'
export const dynamic = 'force-dynamic'

const FIELDS = ['storeName', 'tagline', 'heroTitle', 'heroSub', 'announcement', 'seoDescription']

export async function GET() {
  return Response.json(await get('settings'))
}

export async function PUT(req) {
  if ((await session())?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const next = { ...(await get('settings')) }
  for (const k of FIELDS) if (typeof body[k] === 'string') next[k] = body[k]
  await set('settings', next)
  return Response.json(next)
}
