import Link from 'next/link'
import { money } from '@/lib/money'

export default function Card({ p }) {
  return (
    <Link href={`/products/${p.slug}`} className="card">
      <div className="ph">
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : p.name[0]}
      </div>
      <div className="in">
        <small>{p.category}</small>
        <h3>{p.name}</h3>
        <span className="price">{money(p.price)}</span>
        {p.stock < 1 && <small> · Sold out</small>}
      </div>
    </Link>
  )
}
