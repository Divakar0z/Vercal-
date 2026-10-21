'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const router = useRouter()
  const on = k => e => setF({ ...f, [k]: e.target.value })

  const submit = async e => {
    e.preventDefault(); setErr('')
    const r = await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: mode, ...f }) })
    const d = await r.json()
    if (!r.ok) return setErr(d.error)
    router.push(d.role === 'admin' ? '/admin' : '/account')
    router.refresh()
  }

  return (
    <div className="wrap narrow">
      <div className="panel">
        <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
        <form className="stack" onSubmit={submit}>
          {mode === 'register' && <label>Full name<input value={f.name} onChange={on('name')} autoComplete="name" required /></label>}
          <label>Email<input type="email" value={f.email} onChange={on('email')} autoComplete="email" required /></label>
          <label>Password<input type="password" value={f.password} onChange={on('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {err && <p className="err">{err}</p>}
          <button className="btn">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <a href="#" onClick={e => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setErr('') }} style={{ color: '#4cc3ee' }}>
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </a>
        </p>
      </div>
    </div>
  )
}
