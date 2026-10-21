import Link from 'next/link'
import { session } from '@/lib/auth'
import { CartLink, LogoutButton } from './client'

export default async function Header({ s }) {
  const u = await session()
  return (
    <>
      {s.announcement && <div className="bar">{s.announcement}</div>}
      <header className="head">
        <Link href="/" className="logo">{s.storeName}</Link>
        <nav aria-label="Main">
          <Link href="/#shop">Shop</Link>
          {u?.role === 'admin' && <Link href="/admin">Admin</Link>}
          {u ? (
            <>
              <Link href="/account">{u.name.split(' ')[0]}</Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
          <CartLink />
        </nav>
      </header>
    </>
  )
}
