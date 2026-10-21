import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { get, set, uid } from '@/lib/db'
import { sign, session } from '@/lib/auth'
export const dynamic = 'force-dynamic'

const login = async u =>
  cookies().set('token', await sign(u), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  })
const bad = (error, status = 400) => Response.json({ error }, { status })

export async function GET() {
  return Response.json({ user: await session() })
}

export async function POST(req) {
  const { action, name = '', email = '', password = '' } = await req.json()
  if (action === 'logout') { cookies().delete('token'); return Response.json({ ok: true }) }

  const users = await get('users')
  const mail = email.trim().toLowerCase()

  if (action === 'register') {
    if (!name.trim() || !mail.includes('@') || password.length < 6) return bad('Enter your name, a valid email and a password of 6+ characters')
    if (users.some(u => u.email === mail)) return bad('This email is already registered', 409)
    const user = { id: uid('u'), name: name.trim(), email: mail, hash: bcrypt.hashSync(password, 10), role: 'user', createdAt: Date.now() }
    await set('users', [...users, user])
    await login(user)
    return Response.json({ role: user.role })
  }

  const user = users.find(u => u.email === mail)
  if (!user || !bcrypt.compareSync(password, user.hash)) return bad('Wrong email or password', 401)
  await login(user)
  return Response.json({ role: user.role })
}
