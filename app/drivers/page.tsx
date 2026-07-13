'use client'
import Link from 'next/link'
import { useDrivers } from '@/hooks/useDrivers'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'

export default function DriversPage() {
  const { drivers, loading, error } = useDrivers()

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading drivers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
        <p style={{ color: '#f87171' }}>Error: {error}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#0a0c10', minHeight: '100vh', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Drivers</h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{drivers.length} total drivers</p>
        </div>
        <Link href='/drivers/new'>
          <Button>+ Add Driver</Button>
        </Link>
      </div>

      <div style={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#20222c' }}>
                {['Name', 'Phone', 'License No', 'Availability', 'Action'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px', fontSize: '13px' }}>
                    No drivers yet
                  </td>
                </tr>
              )}
              {drivers.map((d) => (
                <tr 
                  key={d.id} 
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} 
                  onClick={() => window.location.href = `/drivers/${d.id}`}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px', color: '#fff' }}>{d.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{d.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{d.license_number || '-'}</td>
                  <td style={{ padding: '12px 16px' }}><PaymentBadge status={d.availability} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/drivers/${d.id}`} style={{ color: '#60a5fa', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}