import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const key = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-badal-lena')

export const sign = u =>
  new SignJWT({ id: u.id, role: u.role, name: u.name, email: u.email })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key())

export async function session() {
  const t = cookies().get('token')?.value
  if (!t) return null
  try { return (await jwtVerify(t, key())).payload } catch { return null }
}
