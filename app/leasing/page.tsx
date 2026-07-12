'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { formatKES, formatDate } from '@/lib/utils'
import PaymentBadge from '@/components/PaymentBadge'

function calcExpected(startDate: string, amount: number, frequency: string): number {
  const start = new Date(startDate)
  const now = new Date()
  if (start > now) return 0
  let periods = 0
  if (frequency === 'monthly') {
    periods = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    // only count today if we've reached the day-of-month
    if (now.getDate() > start.getDate()) periods += 1
    // if today IS the due date, don't add yet (payment due today, not overdue)
  } else if (frequency === 'weekly') {
    periods = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  } else {
    periods = 1
  }
  return periods * amount
}

function getNextDueDate(startDate: string, frequency: string): string {
  const start = new Date(startDate)
  const now = new Date()
  if (frequency === 'monthly') {
    const next = new Date(now.getFullYear(), now.getMonth(), start.getDate())
    if (next < now) next.setMonth(next.getMonth() + 1)
    return next.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return '-'
}

export default function LeasingPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [ownerMap, setOwnerMap] = useState<Record<string, any>>({})
  const [vehicleMap, setVehicleMap] = useState<Record<string, any>>({})
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cs, owners, vehicles, pays] = await Promise.all([
          db.getLeasingContracts(),
          db.getLeasingOwners(),
          db.getVehicles(),
          db.getPayments({ category: 'Leasing Payout' }),
        ])
        const oMap: Record<string, any> = {}
        owners.forEach((o: any) => { oMap[o.id] = o })
        const vMap: Record<string, any> = {}
        vehicles.forEach((v: any) => { vMap[v.id] = v })
        setOwnerMap(oMap)
        setVehicleMap(vMap)
        setContracts(cs)
        setPayments(pays)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading leasing contracts...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif', background: '#0a0c10', minHeight: '100vh', padding: '20px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Leasing</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{contracts.length} active contract{contracts.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href='/leasing/payouts' style={{ textDecoration: 'none' }}>
            <button style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Payouts
            </button>
          </Link>
          <Link href='/leasing/new' style={{ textDecoration: 'none' }}>
            <button style={{ padding: '9px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              + New Contract
            </button>
          </Link>
        </div>
      </div>

      {/* Contract Cards */}
      {contracts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No leasing contracts yet</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {contracts.map(c => {
          const owner = ownerMap[c.owner]
          const vehicle = vehicleMap[c.vehicle]
          const contractPayments = payments
          const totalPaid = contractPayments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
          const expected = calcExpected(c.start_date, c.payout_amount, c.payout_frequency)
          const balance = expected - totalPaid
          const nextDue = getNextDueDate(c.start_date, c.payout_frequency)

          return (
            <div key={c.id} style={{
              background: '#1a1c24',
              border: `1.5px solid ${balance > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}>
              {/* Color bar */}
              <div style={{ height: '4px', background: balance > 0 ? '#ef4444' : '#22c55e' }} />

              {/* Card Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0 }}>{owner?.name || '-'}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>
                    {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate})` : '-'}
                  </p>
                </div>
                <PaymentBadge status={c.status} />
              </div>

              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Monthly', value: formatKES(c.payout_amount), color: '#60a5fa' },
                  { label: 'Paid', value: formatKES(totalPaid), color: '#4ade80' },
                  { label: 'Balance', value: formatKES(balance), color: balance > 0 ? '#f87171' : '#4ade80' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#1a1c24', padding: '12px 14px', textAlign: 'center' }}>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Start Date</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: '2px 0 0' }}>{formatDate(c.start_date)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Next Due</p>
                  <p style={{ fontSize: '12px', color: '#fb923c', fontWeight: 600, margin: '2px 0 0' }}>{nextDue}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Phone</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: '2px 0 0' }}>{owner?.phone || '-'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Frequency</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: '2px 0 0' }}>{c.payout_frequency}</p>
                </div>
              </div>

              {/* Action */}
              <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href={`/leasing/${c.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '8px', background: '#2563eb',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    View Contract â†’
                  </button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
