'use client'
import { useParams, useRouter } from 'next/navigation'
import { useCustomer } from '@/hooks/useCustomers'
import { useReservations } from '@/hooks/useReservations'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { customer, loading: customerLoading } = useCustomer(id as string)
  const { reservations, loading: reservationsLoading } = useReservations()

  // Filter reservations for this customer
  const customerReservations = reservations.filter(r => r.customer === id)

  if (customerLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading customer details...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Customer not found</p>
        <button
          onClick={() => router.push('/customers')}
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
          Back to Customers
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#fff' }}>{customer.name}</h1>
        <Button variant='secondary' onClick={() => router.push('/customers')}>
          Back
        </Button>
      </div>

      {/* Customer Info Card */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Phone
            </p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{customer.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Email
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{customer.email || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Location
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{customer.location || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Customer Since
            </p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{formatDate(customer.created)}</p>
          </div>
          {customer.notes && (
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Notes
              </p>
              <p style={{ fontSize: '14px', color: '#475569' }}>{customer.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reservation History */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Reservation History
        </h2>
        
        {reservationsLoading && (
          <p style={{ color: '#64748b', fontSize: '13px' }}>Loading reservations...</p>
        )}
        
        {!reservationsLoading && customerReservations.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No reservations found</p>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {customerReservations.map(r => (
            <div
              key={r.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => window.location.href = `/reservations/${r.id}`}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  {r.service_type || 'Reservation'}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  {r.destination || 'No destination'} · {formatDate(r.created)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {formatKES(r.amount || 0)}
                </span>
                <PaymentBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
