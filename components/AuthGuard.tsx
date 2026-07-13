'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

const INACTIVITY_MS = 3 * 60 * 1000 // 3 minutes

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isPublic = pathname === '/login' || pathname === '/' || pathname === '/reset-password'

  // Gate access on the real Supabase session, and react to sign-in/out.
  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (!data.session && !isPublic) {
        router.replace('/login')
      } else {
        if (data.session) setTimedOut(false)
        setReady(true)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session) {
        // A fresh sign-in clears any prior inactivity lock so the timer restarts.
        setTimedOut(false)
      } else if (!isPublic) {
        router.replace('/login')
      }
    })

    return () => { active = false; sub.subscription.unsubscribe() }
  }, [pathname, router, isPublic])

  // Auto-logout after INACTIVITY_MS of no user activity (authenticated pages only)
  useEffect(() => {
    if (isPublic) return

    async function logout() {
      await supabase.auth.signOut()
      setTimedOut(true)
    }

    function reset() {
      if (timedOut) return
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, INACTIVITY_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [isPublic, timedOut])

  if (!ready) return null
  if (isPublic) return <>{children}</>

  const isDashboard = pathname === '/dashboard'

  return (
    <div className='flex h-screen overflow-hidden' style={{ background: '#0a0c10' }}>
      <Sidebar />
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Navbar />
        <main
          className='flex-1 p-6'
          style={{ overflow: isDashboard ? 'hidden' : 'auto' }}
        >
          {children}
        </main>
      </div>

      {/* Inactivity timeout overlay */}
      {timedOut && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,12,20,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div style={{
            width: '100%', maxWidth: 380, margin: '0 24px', padding: '36px 32px', textAlign: 'center',
            borderRadius: 18, border: '1px solid rgba(217,173,26,0.4)',
            background: 'rgba(6,32,48,0.9)', boxShadow: '0 30px 90px rgba(0,0,0,0.55)',
          }}>
            <div style={{
              width: 54, height: 54, margin: '0 auto 20px', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)', boxShadow: '0 8px 30px rgba(217,173,26,0.4)',
            }}>
              <span style={{ fontSize: 26 }}>&#9203;</span>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif' }}>Are you still there?</h2>
            <p style={{ margin: '0 0 26px', fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
              You&apos;ve been logged out due to inactivity to keep the system secure.
            </p>
            <button
              onClick={() => { setTimedOut(false); router.replace('/login') }}
              style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: 10, cursor: 'pointer',
                background: 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)', color: '#1a1400',
                fontSize: 14, fontWeight: 700, boxShadow: '0 10px 30px rgba(217,173,26,0.35)',
              }}
            >
              Log back in
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
