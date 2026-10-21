import { get, set, uid, slugify } from '@/lib/db'
import { session } from '@/lib/auth'
export const dynamic = 'force-dynamic'

const isAdmin = async () => (await session())?.role === 'admin'
const no = () => Response.json({ error: 'Forbidden' }, { status: 403 })
const clean = b => ({
  name: String(b.name || '').trim(),
  price: Math.max(0, Number(b.price) || 0),
  category: String(b.category || 'General').trim(),
  desc: String(b.desc || ''),
  image: String(b.image || '').trim(),
  stock: Math.max(0, parseInt(b.stock) || 0),
  featured: !!b.featured,
})

export async function GET() {
  return Response.json(await get('products'))
}

export async function POST(req) {
  if (!(await isAdmin())) return no()
  const b = clean(await req.json())
  if (!b.name) return Response.json({ error: 'Name is required' }, { status: 400 })
  const list = await get('products')
  let slug = slugify(b.name)
  if (list.some(p => p.slug === slug)) slug += '-' + Date.now().toString(36)
  const p = { id: uid('p'), slug, ...b }
  await set('products', [p, ...list])
  return Response.json(p)
}

export async function PUT(req) {
  if (!(await isAdmin())) return no()
  const body = await req.json()
  const list = await get('products')
  await set('products', list.map(p => (p.id === body.id ? { ...p, ...clean(body) } : p)))
  return Response.json({ ok: true })
}

export async function DELETE(req) {
  if (!(await isAdmin())) return no()
  const id = new URL(req.url).searchParams.get('id')
  await set('products', (await get('products')).filter(p => p.id !== id))
  return Response.json({ ok: true })
}
