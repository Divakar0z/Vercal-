'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const read = () => { try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] } }

export function CartLink() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const f = () => setN(read().reduce((a, i) => a + i.qty, 0))
    f()
    window.addEventListener('cart', f)
    return () => window.removeEventListener('cart', f)
  }, [])
  return <Link href="/cart" className="cart">Cart{n > 0 && <b>{n}</b>}</Link>
}

export function LogoutButton() {
  const router = useRouter()
  const out = async () => {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) })
    router.push('/')
    router.refresh()
  }
  return <button onClick={out}>Logout</button>
}

export function AddToCart({ p }) {
  const [done, setDone] = useState(false)
  const add = () => {
    const cart = read()
    const line = cart.find(i => i.id === p.id)
    if (line) line.qty = Math.min(p.stock, line.qty + 1)
    else cart.push({ ...p, qty: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart'))
    setDone(true)
    setTimeout(() => setDone(false), 1500)
  }
  if (p.stock < 1) return <button className="btn" disabled>Out of stock</button>
  return <button className="btn" onClick={add}>{done ? 'Added to cart' : 'Add to cart'}</button>
}
