'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is logged in
    const auth = localStorage.getItem('rd_auth')
    
    if (auth === 'true') {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#0a0c10',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 10px',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>Loading...</p>
      </div>
    </div>
  )
}