'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, CalendarCheck, Users, KeyRound, CreditCard, BarChart3, ArrowRight, ShieldCheck,
  MapPin, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ---- Brand palette ----
const OFFWHITE = '#CBCBCE'          // "Blessed"
const GOLD = '#D9AD1A'              // "RoyalDrive"
const CYAN = '#55A1B6'              // Mobility gradient start
const INDIGO = '#4E52BF'           // Mobility gradient end
const GOLD_GRADIENT = 'linear-gradient(90deg,#f4d466,#D9AD1A,#b8901a)'
const MOBILITY_GRADIENT = `linear-gradient(90deg,${CYAN},${INDIGO})`
const BODY = 'rgba(203,203,206,0.72)'
const MUTED = 'rgba(203,203,206,0.5)'

const STATS = [
  { value: '6', label: 'Modules' },
  { value: '8', label: 'Collections' },
  { value: 'Mpesa', label: 'Cash · Bank' },
  { value: '24/7', label: 'Availability' },
]

const FEATURES = [
  { icon: Car, title: 'Fleet Management', desc: 'Track every vehicle, availability, daily rates and service status in one place.' },
  { icon: CalendarCheck, title: 'Reservations', desc: 'Airport transfers, chauffeur, self-drive, weddings and long distance — scheduled and confirmed.' },
  { icon: Users, title: 'Drivers', desc: 'Manage driver profiles, licensing, expiry dates and duty availability.' },
  { icon: KeyRound, title: 'Leasing', desc: 'Owner contracts and automated weekly or monthly payout tracking.' },
  { icon: CreditCard, title: 'Payments', desc: 'Record and reconcile Mpesa, cash and bank transfers across every service.' },
  { icon: BarChart3, title: 'Reports', desc: 'Revenue, utilisation and performance insight at a glance.' },
]

const CARD = {
  border: '1px solid rgba(255,255,255,0.22)',
  background: 'rgba(6,32,48,0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 16px 40px rgba(4,26,40,0.35)',
}

function onHover(e: React.MouseEvent<HTMLDivElement>, on: boolean) {
  const el = e.currentTarget
  el.style.borderColor = on ? 'rgba(217,173,26,0.7)' : 'rgba(255,255,255,0.22)'
  el.style.transform = on ? 'translateY(-4px)' : 'translateY(0)'
  el.style.background = on ? 'rgba(10,45,64,0.72)' : 'rgba(6,32,48,0.6)'
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 44 }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ffe6a1', fontWeight: 700, textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>{kicker}</p>
      <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#ffffff', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>{title}</h2>
      {sub && <p style={{ margin: '0 auto', maxWidth: 580, fontSize: 14.5, lineHeight: 1.7, color: '#ffffff', textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}>{sub}</p>}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  // Always show the landing page first. We only note whether the user is
  // already signed in so the CTA can send them to the right place.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session))
  }, [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: OFFWHITE, fontFamily: 'inherit', overflowX: 'hidden' }}>
      {/* ===== Sea photo background ===== */}
      <div className="sea-bg" aria-hidden />
      {/* readability veil over the photo */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(4,20,32,0.35), rgba(4,20,32,0.55))' }} />

      {/* All page content sits above the sea */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* ============ HERO ============ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', overflow: 'hidden' }}>

        <div style={{
          position: 'relative', width: '100%', maxWidth: 740, padding: '56px 40px',
          borderRadius: 24, border: '1px solid rgba(217,173,26,0.4)',
          background: 'rgba(6,32,48,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 30px 90px rgba(4,26,40,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>
          <div style={{ width: 62, height: 62, margin: '0 auto 26px', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: GOLD_GRADIENT, boxShadow: '0 8px 34px rgba(217,173,26,0.4)' }}>
            <span style={{ color: '#1a1400', fontWeight: 800, fontSize: 27, fontFamily: 'Georgia, serif' }}>R</span>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '0.34em', textTransform: 'uppercase', color: MUTED }}>
            Mobility · Chauffeur · Sales
          </p>

          <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(32px,6vw,56px)', lineHeight: 1.06, fontWeight: 800, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            <span style={{ color: OFFWHITE }}>Blessed </span>
            <span style={{ background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>RoyalDrive</span>
            <br />
            <span style={{ background: MOBILITY_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>Mobility</span>
          </h1>

          <p style={{ margin: '0 0 12px', fontSize: 15, letterSpacing: '0.08em', color: GOLD }}>Every Journey, Elevated</p>

          <p style={{ margin: '0 auto 34px', maxWidth: 520, fontSize: 15, lineHeight: 1.75, color: BODY }}>
            Executive car hire, chauffeur services and curated vehicle sales — serving Murang&apos;a,
            Sagana, Kenol, Thika and the wider country, every day of the year.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => router.push(loggedIn ? '/dashboard' : '/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 34px',
                border: 'none', borderRadius: 12, cursor: 'pointer',
                background: GOLD_GRADIENT, color: '#1a1400', fontSize: 15, fontWeight: 700,
                letterSpacing: '0.02em', boxShadow: '0 10px 34px rgba(217,173,26,0.38)',
                transition: 'transform .15s ease, box-shadow .15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(217,173,26,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(217,173,26,0.38)' }}
            >
              {loggedIn ? 'Enter Dashboard' : 'Sign in'} <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </div>

          <p style={{ margin: '52px 0 0', fontSize: 12, color: MUTED, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={13} style={{ color: GOLD }} /> {loggedIn ? 'Signed in — welcome back' : 'Staff & administrators only'}
          </p>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, ...CARD, borderRadius: 18, padding: '28px 20px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Georgia, serif', background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>{s.value}</div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: MUTED, letterSpacing: '0.02em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURE GRID (management system) ============ */}
      <section style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', padding: '40px 24px 20px' }}>
        <SectionHead kicker="Inside the System" title="A Complete Mobility Operation" sub="Behind every journey is a management console that keeps the whole operation running." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: '28px 26px', borderRadius: 16, transition: 'border-color .2s ease, transform .2s ease, background .2s ease', ...CARD }}
              onMouseEnter={e => onHover(e, true)} onMouseLeave={e => onHover(e, false)}>
              <div style={{ width: 44, height: 44, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid rgba(85,161,182,0.4)', background: 'rgba(85,161,182,0.12)' }}>
                <Icon size={21} style={{ color: CYAN }} strokeWidth={1.8} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: OFFWHITE }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: BODY }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA STRIP ============ */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 20px' }}>
        <div style={{ borderRadius: 20, padding: '44px 32px', textAlign: 'center', border: '1px solid rgba(217,173,26,0.4)', background: 'linear-gradient(135deg, rgba(6,32,48,0.72), rgba(10,45,64,0.6))', backdropFilter: 'blur(12px)', boxShadow: '0 20px 50px rgba(4,26,40,0.4)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(22px,3.6vw,30px)', fontWeight: 800, fontFamily: 'Georgia, serif', color: OFFWHITE }}>Ready to manage the operation?</h2>
          <p style={{ margin: '0 auto 26px', maxWidth: 460, fontSize: 14.5, lineHeight: 1.7, color: BODY }}>Sign in to the RoyalDrive console to handle bookings, fleet, drivers, leasing and payments.</p>
          <button
            onClick={() => router.push(loggedIn ? '/dashboard' : '/login')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 32px', border: 'none', borderRadius: 12, cursor: 'pointer', background: GOLD_GRADIENT, color: '#1a1400', fontSize: 15, fontWeight: 700, boxShadow: '0 10px 30px rgba(217,173,26,0.35)' }}>
            {loggedIn ? 'Enter Dashboard' : 'Sign in'} <ArrowRight size={17} strokeWidth={2.4} />
          </button>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ padding: '36px 24px 30px', textAlign: 'center', marginTop: 40, background: 'rgba(6,32,48,0.55)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 28px', marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            <MapPin size={14} style={{ color: GOLD }} /> Murang&apos;a Town, Murang&apos;a County
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            <Phone size={14} style={{ color: GOLD }} /> 0716 233 680
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
          © 2026 Blessed RoyalDrive Mobility · Every Journey, Elevated · Available every day of the year
        </p>
      </footer>
      </div>
    </div>
  )
}
