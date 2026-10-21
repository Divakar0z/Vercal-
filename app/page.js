import Link from 'next/link'
import { get } from '@/lib/db'
import Card from '@/components/Card'

export default async function Home({ searchParams }) {
  const [s, products] = await Promise.all([get('settings'), get('products')])
  const cat = searchParams?.cat
  const cats = [...new Set(products.map(p => p.category))]
  const list = cat ? products.filter(p => p.category === cat) : products
  const [first, ...rest] = s.heroTitle.split(' ')

  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <h1><span className="a">{first}</span><span className="b">{rest.join(' ')}</span></h1>
          <p>{s.heroSub}</p>
          <Link href="/#shop" className="btn">Shop now</Link>
        </div>
        <div className="orb" aria-hidden="true" />
      </section>

      <section id="shop">
        <h2>{cat || 'All products'}</h2>
        <div className="chips">
          <Link href="/#shop" className={!cat ? 'on' : ''}>All</Link>
          {cats.map(c => (
            <Link key={c} href={`/?cat=${encodeURIComponent(c)}#shop`} className={cat === c ? 'on' : ''}>{c}</Link>
          ))}
        </div>
        {list.length ? (
          <div className="grid">{list.map(p => <Card key={p.id} p={p} />)}</div>
        ) : (
          <p className="muted">Nothing in this category yet.</p>
        )}
      </section>
    </div>
  )
}
