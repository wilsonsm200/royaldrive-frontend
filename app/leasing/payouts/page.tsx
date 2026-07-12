'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'

export default function PayoutsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.getPayments({ category: 'Leasing Payout' })
      .then(data => {
        const sorted = [...data].sort((a: any, b: any) =>
          new Date(b.payment_date || b.created).getTime() - new Date(a.payment_date || a.created).getTime()
        )
        setPayments(sorted)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading payouts...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif', background: '#0a0c10', minHeight: '100vh', padding: '20px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Leasing Payouts</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{payments.length} payout{payments.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 20px', textAlign: 'right' }}>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#f87171', margin: 0 }}>{formatKES(totalPaid)}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', fontWeight: 500 }}>Total Paid Out</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              {['For', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px', fontSize: '13px' }}>
                  No payouts recorded yet
                </td>
              </tr>
            )}
            {payments.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  {p.notes || p.reference_id || 'Leasing Payout'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#f87171' }}>
                  {formatKES(p.amount)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  {p.method || '-'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  {formatDate(p.payment_date || p.created)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <PaymentBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
