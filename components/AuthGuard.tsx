'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('rd_auth')
    if (!auth && pathname !== '/login') {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [pathname, router])

  if (!ready) return null
  if (pathname === '/login') return <>{children}</>

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
    </div>
  )
}
