'use client'
import { useParams, useRouter } from 'next/navigation'
import { usePayment } from '@/hooks/usePayments'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

export default function PaymentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { payment, loading } = usePayment(id as string)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading payment details...</p>
      </div>
    )
  }

  if (!payment) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Payment not found</p>
        <button
          onClick={() => router.push('/payments')}
          style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back to Payments
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Payment Detail</h1>
        <Button variant='secondary' onClick={() => router.push('/payments')}>Back</Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Category</p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{payment.category}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Reference</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{payment.reference_id || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Amount</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formatKES(payment.amount)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Method</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{payment.method}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Payment Date</p>
            <p style={{ fontSize: '14px', color: '#0f172a' }}>{formatDate(payment.payment_date || payment.created)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Status</p>
            <PaymentBadge status={payment.status} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Recorded</p>
            <p style={{ fontSize: '14px', color: '#475569' }}>{formatDate(payment.created)}</p>
          </div>
          {payment.notes && (
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Notes</p>
              <p style={{ fontSize: '14px', color: '#475569' }}>{payment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}