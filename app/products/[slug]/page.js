import { notFound } from 'next/navigation'
import { get } from '@/lib/db'
import { money } from '@/lib/money'
import { AddToCart } from '@/components/client'

const find = async slug => (await get('products')).find(p => p.slug === slug)

export async function generateMetadata({ params }) {
  const p = await find(params.slug)
  if (!p) return { title: 'Product not found', robots: { index: false } }
  const description = p.desc.slice(0, 155)
  return {
    title: p.name,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description, images: p.image ? [p.image] : [] },
  }
}

export default async function ProductPage({ params }) {
  const p = await find(params.slug)
  if (!p) notFound()

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.desc,
    category: p.category, image: p.image || undefined,
    offers: {
      '@type': 'Offer', price: p.price, priceCurrency: 'INR',
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="wrap pd">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <div className="ph">{p.image ? <img src={p.image} alt={p.name} /> : p.name[0]}</div>
      <div>
        <span className="tag">{p.category}</span>
        <h1>{p.name}</h1>
        <span className="price">{money(p.price)}</span>
        <p>{p.desc}</p>
        <AddToCart p={{ id: p.id, name: p.name, price: p.price, slug: p.slug, stock: p.stock }} />
        <p style={{ marginTop: 14 }}>{p.stock > 0 ? `${p.stock} in stock` : 'Currently unavailable'}</p>
      </div>
    </div>
  )
}
