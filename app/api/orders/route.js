import { get, set, uid } from '@/lib/db'
import { session } from '@/lib/auth'
export const dynamic = 'force-dynamic'

const err = (error, status = 400) => Response.json({ error }, { status })
const STATUS = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']

export async function GET() {
  const s = await session()
  if (!s) return err('Login required', 401)
  const orders = await get('orders')
  const mine = s.role === 'admin' ? orders : orders.filter(o => o.userId === s.id)
  return Response.json(mine.sort((a, b) => b.createdAt - a.createdAt))
}

export async function POST(req) {
  const s = await session()
  if (!s) return err('Login required', 401)
  const { items = [], address = '', phone = '' } = await req.json()
  if (!items.length) return err('Cart is empty')
  if (address.trim().length < 8) return err('Enter a full delivery address')
  if (phone.replace(/\D/g, '').length < 10) return err('Enter a valid phone number')

  // price hamesha server se, browser ka bharosa nahi
  const products = await get('products')
  const lines = []
  for (const i of items) {
    const p = products.find(x => x.id === i.id)
    const qty = Math.max(1, parseInt(i.qty) || 1)
    if (!p) return err('A product in your cart no longer exists')
    if (p.stock < qty) return err(`Only ${p.stock} left of ${p.name}`)
    lines.push({ id: p.id, name: p.name, price: p.price, qty })
  }
  await set('products', products.map(p => {
    const l = lines.find(x => x.id === p.id)
    return l ? { ...p, stock: p.stock - l.qty } : p
  }))
  const order = {
    id: uid('ORD').toUpperCase(), userId: s.id, userName: s.name, email: s.email,
    items: lines, total: lines.reduce((a, l) => a + l.price * l.qty, 0),
    address: address.trim(), phone: phone.trim(), status: 'Placed', createdAt: Date.now(),
  }
  await set('orders', [order, ...(await get('orders'))])
  return Response.json(order)
}

export async function PATCH(req) {
  const s = await session()
  if (s?.role !== 'admin') return err('Forbidden', 403)
  const { id, status } = await req.json()
  if (!STATUS.includes(status)) return err('Bad status')
  await set('orders', (await get('orders')).map(o => (o.id === id ? { ...o, status } : o)))
  return Response.json({ ok: true })
}
