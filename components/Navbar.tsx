'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import pb from '@/lib/pocketbase'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reservations': 'Reservations',
  '/customers': 'Customers',
  '/fleet': 'Fleet',
  '/drivers': 'Drivers',
  '/leasing': 'Leasing',
  '/leasing/owners': 'Car Owners',
  '/leasing/payouts': 'Payouts',
  '/payments': 'Payments',
  '/reports': 'Reports',
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = titles[pathname] || 'RoyalDrive'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const user = pb.authStore.model as any
  const userName = user?.name || user?.email?.split('@')[0] || 'Admin'
  const userInitial = userName.charAt(0).toUpperCase()

  const handleLogout = () => {
    localStorage.removeItem('rd_auth')
    pb.authStore.clear()
    router.push('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // Dispatch event for sidebar to listen
    const event = new CustomEvent('toggleSidebar', { detail: { isOpen: !isMobileMenuOpen } })
    window.dispatchEvent(event)
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '56px',
          background: '#0f1117',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Left side - Hamburger menu + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hamburger Menu Button - Mobile only */}
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <h2 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.01em',
            margin: 0,
          }}>
            {title}
          </h2>
        </div>

        {/* Right side - User info + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {userName}
            </p>
            <p style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.35)',
              margin: '2px 0 0',
            }}>
              Admin
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onClick={handleLogout}
            title="Sign out"
          >
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.5px',
            }}>
              {userInitial}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile menu styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}