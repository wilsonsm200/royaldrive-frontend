'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setError(''); setInfo('')
    if (!email || !password) { setError('Enter your email and password.'); return }
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) {
      setError(error.message || 'Sign in failed. Check your credentials.')
    } else {
      router.push('/dashboard')
    }
  }

  async function handleForgot() {
    setError(''); setInfo('')
    if (!email) { setError('Enter your email above first, then click "Forgot password".'); return }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    if (error) setError(error.message)
    else setInfo('If that email is registered, a password reset link has been sent.')
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* ===== Sea photo background ===== */}
      <div className="sea-bg" aria-hidden />
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(4,20,32,0.4), rgba(4,20,32,0.6))' }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(6,32,48,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '18px',
        border: '1px solid rgba(217,173,26,0.4)',
        padding: '40px',
        boxShadow: '0 30px 90px rgba(4,26,40,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 30px rgba(217,173,26,0.4)',
          }}>
            <span style={{ color: '#1a1400', fontWeight: 800, fontSize: '22px', fontFamily: 'Georgia, serif' }}>R</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>RoyalDrive</h1>
          <p style={{ fontSize: '13px', color: 'rgba(203,203,206,0.6)' }}>Sign in to continue</p>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(203,203,206,0.85)', display: 'block', marginBottom: '7px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="admin@royaldrive.co.ke"
            style={{
              width: '100%',
              padding: '11px 14px',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#ffffff',
              outline: 'none',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(203,203,206,0.85)', display: 'block', marginBottom: '7px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '11px 14px',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#ffffff',
              outline: 'none',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '14px' }}>{error}</p>
        )}
        {info && (
          <p style={{ fontSize: '12px', color: '#86efac', marginBottom: '14px' }}>{info}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={busy}
          style={{
            width: '100%',
            padding: '13px',
            background: 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)',
            color: '#1a1400',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.7 : 1,
            boxShadow: '0 10px 30px rgba(217,173,26,0.35)',
          }}
        >
          {busy ? 'Please wait…' : 'Sign in'}
        </button>

        <p style={{ fontSize: '12px', color: 'rgba(203,203,206,0.55)', textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleForgot}
            disabled={busy}
            style={{ background: 'none', border: 'none', color: '#D9AD1A', fontSize: '12px', fontWeight: 600, cursor: busy ? 'default' : 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Forgot password?
          </button>
        </p>
      </div>

      {/* Back button — just below the sign-in card */}
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '10px 18px',
          background: 'rgba(6,32,48,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,173,26,0.7)'; e.currentTarget.style.color = '#ffffff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
      >
        <ArrowLeft size={15} strokeWidth={2.4} /> Back
      </button>
    </div>
  )
}