'use client'
import { useEffect, useState } from 'react'
import { money } from '@/lib/money'

const STATUS = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
const blank = { name: '', price: '', category: '', image: '', stock: 10, desc: '', featured: true }
const SET_FIELDS = [
  ['storeName', 'Store name'], ['tagline', 'Tagline'], ['heroTitle', 'Hero title (first word blue, rest pink)'],
  ['heroSub', 'Hero subtitle'], ['announcement', 'Top bar message'], ['seoDescription', 'SEO description (about 150 chars)'],
]

const api = async (url, method = 'GET', body) => {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  return r.json()
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [s, setS] = useState({})
  const [f, setF] = useState(blank)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setProducts(await api('/api/products'))
    setOrders(await api('/api/orders'))
    setS(await api('/api/settings'))
  }
  useEffect(() => { load() }, [])
  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2000) }

  const saveProduct = async e => {
    e.preventDefault()
    await api('/api/products', f.id ? 'PUT' : 'POST', f)
    setF(blank); await load(); flash('Product saved')
  }
  const del = async p => {
    if (!confirm(`Delete ${p.name}?`)) return
    await api('/api/products?id=' + p.id, 'DELETE'); await load()
  }
  const setStatus = async (id, status) => { await api('/api/orders', 'PATCH', { id, status }); await load() }
  const saveSettings = async e => { e.preventDefault(); await api('/api/settings', 'PUT', s); flash('Settings saved') }

  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0)
  const low = products.filter(p => p.stock < 5).length
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <div style={{ padding: '10px 0 60px' }}>
      <div className="tabs">
        {['overview', 'products', 'orders', 'settings'].map(t => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {msg && <p className="ok" style={{ marginBottom: 12 }}>{msg}</p>}

      {tab === 'overview' && (
        <div className="stats">
          <div className="panel"><b>{money(revenue)}</b><span className="muted">Revenue</span></div>
          <div className="panel"><b>{orders.length}</b><span className="muted">Orders</span></div>
          <div className="panel"><b>{orders.filter(o => o.status === 'Placed').length}</b><span className="muted">Waiting to pack</span></div>
          <div className="panel"><b>{products.length}</b><span className="muted">Products</span></div>
          <div className="panel"><b>{low}</b><span className="muted">Low stock (under 5)</span></div>
        </div>
      )}

      {tab === 'products' && (
        <>
          <form className="panel stack" onSubmit={saveProduct}>
            <h2 style={{ fontSize: 20, margin: 0 }}>{f.id ? 'Edit product' : 'Add product'}</h2>
            <div className="two">
              <label>Name<input value={f.name} onChange={set('name')} required /></label>
              <label>Category<input value={f.category} onChange={set('category')} /></label>
              <label>Price (₹)<input type="number" min="0" value={f.price} onChange={set('price')} required /></label>
              <label>Stock<input type="number" min="0" value={f.stock} onChange={set('stock')} /></label>
            </div>
            <label>Image URL (optional)<input value={f.image} onChange={set('image')} placeholder="https://..." /></label>
            <label>Description<textarea rows="3" value={f.desc} onChange={set('desc')} /></label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn">{f.id ? 'Update' : 'Add product'}</button>
              {f.id && <button type="button" className="btn ghost" onClick={() => setF(blank)}>Cancel</button>}
            </div>
          </form>
          <div className="panel scroll">
            <table className="tbl">
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}<br /><span className="muted">{p.category}</span></td>
                    <td>{money(p.price)}</td><td>{p.stock}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn blue sm" onClick={() => { setF(p); window.scrollTo(0, 0) }}>Edit</button>{' '}
                      <button className="btn ghost sm" onClick={() => del(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="panel scroll">
          {!orders.length && <p className="muted">No orders yet.</p>}
          <table className="tbl">
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><b>{o.id}</b><br /><span className="muted">{new Date(o.createdAt).toLocaleString('en-IN')}</span></td>
                  <td>{o.userName}<br /><span className="muted">{o.email}<br />{o.phone}</span></td>
                  <td>{o.items.map(i => <div key={i.id}>{i.name} × {i.qty}</div>)}<span className="muted">{o.address}</span></td>
                  <td className="price">{money(o.total)}</td>
                  <td><select value={o.status} onChange={e => setStatus(o.id, e.target.value)}>{STATUS.map(x => <option key={x}>{x}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <form className="panel stack" onSubmit={saveSettings} style={{ maxWidth: 640 }}>
          {SET_FIELDS.map(([k, label]) => (
            <label key={k}>{label}<input value={s[k] || ''} onChange={e => setS({ ...s, [k]: e.target.value })} /></label>
          ))}
          <button className="btn">Save settings</button>
        </form>
      )}
    </div>
  )
}
