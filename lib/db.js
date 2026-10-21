import { Redis } from '@upstash/redis'
import bcrypt from 'bcryptjs'

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = url && token ? new Redis({ url, token }) : null
const mem = (globalThis.__mem ||= {})

export const uid = p => p + '_' + Math.random().toString(36).slice(2, 9)
export const slugify = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const item = (name, price, category, desc) => ({
  id: uid('p'), slug: slugify(name), name, price, category, desc, image: '', stock: 25, featured: true,
})

function seed(key) {
  if (key === 'products') return [
    item('Pulse ANC Headphones', 4999, 'Audio', 'Active noise cancelling, 40 hour battery, and a fit that stays put through a full workday.'),
    item('Glow Mech Keyboard', 3499, 'Gaming', 'Hot-swappable switches with per-key lighting you can tune to any colour.'),
    item('Aero Smartwatch', 2999, 'Wearables', 'AMOLED display, heart rate and sleep tracking, 7 day battery.'),
    item('Cerulean Desk Lamp', 1499, 'Home', 'Dimmable LED lamp with a touch strip and a USB port at the base.'),
    item('Neon Rose Mouse', 1999, 'Gaming', 'Lightweight wireless mouse, 26K DPI sensor, 70 hour battery.'),
    item('Orbit Power Bank', 1299, 'Accessories', '10000 mAh, 22.5W fast charging, small enough for a jeans pocket.'),
  ]
  if (key === 'users') return [{
    id: 'u_admin', name: 'Admin', email: (process.env.ADMIN_EMAIL || 'admin@neonmart.com').toLowerCase(),
    hash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10), role: 'admin', createdAt: Date.now(),
  }]
  if (key === 'orders') return []
  if (key === 'settings') return {
    storeName: 'NEONMART', tagline: 'Gear for the next human',
    heroTitle: 'HUMAN NEXT', heroSub: 'Where creativity meets intelligence',
    announcement: 'Free shipping on orders above ₹999',
    seoDescription: 'NEONMART sells headphones, keyboards, wearables and desk gear. Fast delivery across India.',
  }
}

export async function set(key, val) {
  if (redis) await redis.set(key, val)
  else mem[key] = val
}

export async function get(key) {
  let v = redis ? await redis.get(key) : mem[key]
  if (v == null) { v = seed(key); await set(key, v) }
  return v
}
