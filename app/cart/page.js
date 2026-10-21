'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { money } from '@/lib/money'

export default function Cart() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ address: '', phone: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('cart') || '[]')) } catch {}
  }, [])

  const save = next => {
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart'))
  }
  const change = (id, d) => save(items.map(i => (i.id === id ? { ...i, qty: Math.min(i.stock, Math.max(1, i.qty + d)) } : i)))
  const total = items.reduce((a, i) => a + i.price * i.qty, 0)

  const order = async () => {
    setBusy(true); setErr('')
    const r = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(i => ({ id: i.id, qty: i.qty })), ...form }),
    })
    if (r.status === 401) return router.push('/login')
    const d = await r.json()
    setBusy(false)
    if (!r.ok) return setErr(d.error)
    save([])
    router.push('/account')
  }

  if (!items.length) return <div className="wrap narrow"><h2>Your cart is empty</h2><Link href="/#shop" className="btn">Browse products</Link></div>

  return (
    <div className="wrap" style={{ maxWidth: 720, padding: '40px 20px' }}>
      <h2>Cart</h2>
      <div className="panel">
        {items.map(i => (
          <div className="row" key={i.id}>
            <div><Link href={`/products/${i.slug}`}>{i.name}</Link><br /><span className="price">{money(i.price)}</span></div>
            <div className="qty">
              <button onClick={() => change(i.id, -1)} aria-label="Less">−</button>{i.qty}
              <button onClick={() => change(i.id, 1)} aria-label="More">+</button>
              <button className="btn ghost sm" onClick={() => save(items.filter(x => x.id !== i.id))}>Remove</button>
            </div>
          </div>
        ))}
        <div className="row"><b>Total</b><b className="price">{money(total)}</b></div>
      </div>
      <div className="panel stack">
        <label>Delivery address<textarea rows="3" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
        <label>Phone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} inputMode="tel" /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn" onClick={order} disabled={busy}>{busy ? 'Placing order…' : 'Place order (Cash on delivery)'}</button>
      </div>
    </div>
  )
}
