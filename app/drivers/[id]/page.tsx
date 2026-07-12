'use client'
import { useParams, useRouter } from 'next/navigation'
import { useDriver } from '@/hooks/useDrivers'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatDate } from '@/lib/utils'

const AVAILABILITY_LABELS: Record<string, string> = {
  'Available': 'Available',
  'On Trip': 'On Trip',


  'off_duty': 'Off Duty'
}

export default function DriverDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { driver, loading } = useDriver(id as string)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading driver details...</p>
      </div>
    )
  }

  if (!driver) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Driver not found</p>
        <button
          onClick={() => router.push('/drivers')}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Drivers
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#fff' }}>
          {driver.name}
        </h1>
        <Button variant='secondary' onClick={() => router.push('/drivers')}>
          Back
        </Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Phone
            </p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{driver.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              License Number
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{driver.license_number || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Availability
            </p>
            <PaymentBadge status={driver.availability} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Added
            </p>
            <p style={{ fontSize: '14px', color: '#475569' }}>{formatDate(driver.created)}</p>
          </div>
          {driver.notes && (
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Notes
              </p>
              <p style={{ fontSize: '14px', color: '#475569' }}>{driver.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
