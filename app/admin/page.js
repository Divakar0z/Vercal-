import { redirect } from 'next/navigation'
import { session } from '@/lib/auth'
import AdminPanel from '@/components/AdminPanel'

export const metadata = { title: 'Admin', robots: { index: false } }

export default async function Admin() {
  const s = await session()
  if (s?.role !== 'admin') redirect('/login')
  return <div className="wrap"><AdminPanel /></div>
}
