import Link from 'next/link'
import { redirect } from 'next/navigation'
import { get } from '@/lib/db'
import { session } from '@/lib/auth'
import { money } from '@/lib/money'

export const metadata = { title: 'My account' }
const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered']

export default async function Account() {
  const s = await session()
  if (!s) redirect('/login')
  const orders = (await get('orders')).filter(o => o.userId === s.id).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="wrap" style={{ maxWidth: 760, padding: '40px 20px' }}>
      <h2>Hi, {s.name}</h2>
      <p className="muted" style={{ marginBottom: 24 }}>{s.email}</p>
      <h2 style={{ fontSize: 22 }}>Your orders</h2>
      {!orders.length && <p className="muted">No orders yet. <Link href="/#shop" style={{ color: '#4cc3ee' }}>Start shopping</Link></p>}
      {orders.map(o => {
        const at = STEPS.indexOf(o.status)
        return (
          <div className="panel" key={o.id}>
            <div className="row" style={{ paddingTop: 0 }}>
              <b>{o.id}</b>
              <span className={o.status === 'Cancelled' ? 'tag x' : 'tag'}>{o.status}</span>
            </div>
            {o.items.map(i => <div className="row" key={i.id}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
            <div className="row"><span className="muted">{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.address}</span><b className="price">{money(o.total)}</b></div>
            {o.status !== 'Cancelled' && (
              <ol className="track">{STEPS.map((st, n) => <li key={st} className={n <= at ? 'on' : ''}>{st}</li>)}</ol>
            )}
          </div>
        )
      })}
    </div>
  )
}
