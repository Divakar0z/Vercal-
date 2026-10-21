import './globals.css'
import Header from '@/components/Header'
import { get } from '@/lib/db'
import { site } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const viewport = { themeColor: '#0A0A0A' }

export async function generateMetadata() {
  const s = await get('settings')
  return {
    metadataBase: new URL(site),
    title: { default: `${s.storeName} | ${s.tagline}`, template: `%s | ${s.storeName}` },
    description: s.seoDescription,
    openGraph: { siteName: s.storeName, type: 'website', description: s.seoDescription },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function RootLayout({ children }) {
  const s = await get('settings')
  return (
    <html lang="en">
      <body>
        <Header s={s} />
        <main>{children}</main>
        <footer>© {new Date().getFullYear()} {s.storeName}. {s.tagline}.</footer>
      </body>
    </html>
  )
}
