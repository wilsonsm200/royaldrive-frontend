'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // The recovery link puts a session in the URL; wait until Supabase picks it up.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleUpdate() {
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) { setError(error.message); return }
    setDone(true)
    await supabase.auth.signOut()
    setTimeout(() => router.push('/login'), 1800)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="sea-bg" aria-hidden />
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(4,20,32,0.4), rgba(4,20,32,0.6))' }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px',
        background: 'rgba(6,32,48,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '18px', border: '1px solid rgba(217,173,26,0.4)', padding: '40px',
        boxShadow: '0 30px 90px rgba(4,26,40,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(217,173,26,0.4)' }}>
            <span style={{ color: '#1a1400', fontWeight: 800, fontSize: '22px', fontFamily: 'Georgia, serif' }}>R</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>Set a new password</h1>
          <p style={{ fontSize: '13px', color: 'rgba(203,203,206,0.6)' }}>Choose a strong password you&apos;ll remember.</p>
        </div>

        {done ? (
          <p style={{ fontSize: '13px', color: '#86efac', textAlign: 'center' }}>Password updated. Redirecting to sign in…</p>
        ) : !ready ? (
          <p style={{ fontSize: '13px', color: 'rgba(203,203,206,0.6)', textAlign: 'center' }}>
            Waiting for a valid reset link… Open this page from the link in your email.
          </p>
        ) : (
          <>
            {[
              { label: 'New password', val: password, set: setPassword },
              { label: 'Confirm password', val: confirm, set: setConfirm },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(203,203,206,0.85)', display: 'block', marginBottom: '7px' }}>{f.label}</label>
                <input
                  type="password"
                  value={f.val}
                  onChange={e => { f.set(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '8px', fontSize: '14px', color: '#ffffff', outline: 'none', background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
            ))}

            {error && <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '14px' }}>{error}</p>}

            <button
              onClick={handleUpdate}
              disabled={busy}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)', color: '#1a1400', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1, boxShadow: '0 10px 30px rgba(217,173,26,0.35)' }}
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
