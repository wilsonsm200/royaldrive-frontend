'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { formatKES } from '@/lib/utils'
import { RESERVATION_STATUSES } from '@/lib/constants'

function formatDateTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
}

function formatTripDate(date: string, time: string) {
  if (!date) return 'Not set'
  const parts = date.split('|')
  const s = parts[0]
  const e = parts[1]
  if (e) {
    const days = Math.round((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return s + ' to ' + e + ' (' + days + ' day' + (days > 1 ? 's' : '') + ')'
  }
  return s + (time ? ' at ' + time : '')
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Pending':     { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'Confirmed':   { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  'In Progress': { bg: 'rgba(249,115,22,0.15)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  'Completed':   { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
  'Cancelled':   { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
}

const PAYMENT_STYLE: Record<string, { bg: string; color: string }> = {
  'Paid':    { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  'Unpaid':  { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  'Partial': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
}

const CARD_BORDER: Record<string, string> = {
  'Pending':     'rgba(59,130,246,0.3)',
  'Confirmed':   'rgba(34,197,94,0.3)',
  'In Progress': 'rgba(249,115,22,0.3)',
  'Completed':   'rgba(34,197,94,0.2)',
  'Cancelled':   'rgba(239,68,68,0.3)',
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [customers, setCustomers] = useState<Record<string, any>>({})
  const [vehicles, setVehicles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPayment, setFilterPayment] = useState('All')
  const [statusPopup, setStatusPopup] = useState<string | null>(null)
  const [paymentPopup, setPaymentPopup] = useState<string | null>(null)

  async function load() {
    try {
      const [res, custs, vehs] = await Promise.all([
        db.getReservations(),
        db.getCustomers(),
        db.getVehicles(),
      ])
      const custMap: Record<string, any> = {}
      custs.forEach((c: any) => { custMap[c.id] = c })
      const vehMap: Record<string, string> = {}
      vehs.forEach((v: any) => { vehMap[v.id] = `${v.make} ${v.model} (${v.plate})` })
      setCustomers(custMap)
      setVehicles(vehMap)
      setReservations(res)
    } catch (e) {
      console.error('Failed to load reservations:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    try {
      await db.updateReservation(id, { status })
      setStatusPopup(null)
      load()
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  async function updatePayment(id: string, payment_status: string) {
    try {
      await db.updateReservation(id, { payment_status })
      setPaymentPopup(null)
      load()
    } catch (e) {
      console.error('Failed to update payment:', e)
    }
  }

  const total = reservations.length
  const active = reservations.filter(r => ['In Progress', 'Confirmed'].includes(r.status)).length
  const pending = reservations.filter(r => r.status === 'Pending').length
  const totalRevenue = reservations
    .filter(r => r.status !== 'Cancelled')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0)

  const filtered = reservations.filter(r => {
    const cust = customers[r.customer]
    const custName = (cust?.name || cust?.Name || r.expand?.customer?.name || '').toLowerCase()
    const dest = (r.destination || '').toLowerCase()
    const svc = (r.service_type || '').toLowerCase()
    const s = search.toLowerCase()
    const matchSearch = !s || custName.includes(s) || dest.includes(s) || svc.includes(s)
    const matchStatus = filterStatus === 'All' || r.status === filterStatus
    const matchPayment = filterPayment === 'All' || (r.payment_status || 'Unpaid') === filterPayment
    return matchSearch && matchStatus && matchPayment
  })

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10', minHeight: '100vh' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Loading reservations...</p>
    </div>
  )

  return (
    <div
      style={{ padding: '20px 24px', fontFamily: 'Inter, sans-serif', background: '#0a0c10', minHeight: '100vh' }}
      onClick={() => { setStatusPopup(null); setPaymentPopup(null) }}
    >

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Reservations</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{total} total bookings</p>
        </div>
        <Link href='/reservations/new' style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '9px 18px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: '9px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer'
          }}>
            + New Reservation
          </button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Bookings', value: total,                   color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Active Trips',   value: active,                  color: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
          { label: 'Pending',        value: pending,                 color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Revenue',  value: formatKES(totalRevenue), color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: '12px', padding: '14px 16px',
            border: `1px solid ${s.color}33`
          }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search customer, destination, service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '220px', padding: '9px 14px',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px',
            fontSize: '13px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff'
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9px', fontSize: '13px', background: '#1a1c24', color: '#fff', cursor: 'pointer'
          }}
        >
          <option value='All'>All Statuses</option>
          {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
          style={{
            padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9px', fontSize: '13px', background: '#1a1c24', color: '#fff', cursor: 'pointer'
          }}
        >
          <option value='All'>All Payments</option>
          {['Paid', 'Unpaid', 'Partial'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterStatus !== 'All' || filterPayment !== 'All') && (
          <button
            onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPayment('All') }}
            style={{
              padding: '9px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No reservations found</p>
        </div>
      )}

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
        {filtered.map(r => {
          const cust = customers[r.customer]
          const custName = cust?.name || cust?.Name || r.expand?.customer?.name || '-'
          const vehName = vehicles[r.vehicle] || (r.expand?.vehicle ? `${r.expand.vehicle.make} ${r.expand.vehicle.model} (${r.expand.vehicle.plate})` : '-')
          const status = r.status || 'Pending'
          const statusStyle = STATUS_STYLE[status] || STATUS_STYLE['Pending']
          const payStatus = r.payment_status || 'Unpaid'
          const payStyle = PAYMENT_STYLE[payStatus] || PAYMENT_STYLE['Unpaid']
          const borderColor = CARD_BORDER[status] || 'rgba(255,255,255,0.08)'

          return (
            <div
              key={r.id}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#1a1c24',
                border: `1.5px solid ${borderColor}`,
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'visible',
              }}
            >

              {/* Card Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {custName}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
                      {r.service_type || '-'} â†’ <strong style={{ color: '#fff' }}>{r.destination || '-'}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setStatusPopup(statusPopup === r.id ? null : r.id)
                          setPaymentPopup(null)
                        }}
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          borderRadius: '20px', padding: '3px 10px',
                          fontSize: '10px', fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        {status} â†“
                      </button>
                      {statusPopup === r.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '30px', zIndex: 200,
                          background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                          overflow: 'hidden', minWidth: '150px'
                        }}>
                          {RESERVATION_STATUSES.map(s => {
                            const st = STATUS_STYLE[s] || STATUS_STYLE['Pending']
                            return (
                              <button
                                key={s}
                                onClick={e => { e.stopPropagation(); updateStatus(r.id, s) }}
                                style={{
                                  display: 'block', width: '100%', padding: '9px 14px',
                                  background: status === s ? st.bg : '#1a1c24',
                                  color: st.color, border: 'none', fontSize: '12px',
                                  fontWeight: status === s ? 700 : 500,
                                  cursor: 'pointer', textAlign: 'left',
                                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                                }}
                              >
                                {status === s ? 'âœ“ ' : ''}{s}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setPaymentPopup(paymentPopup === r.id ? null : r.id)
                          setStatusPopup(null)
                        }}
                        style={{
                          background: payStyle.bg,
                          color: payStyle.color,
                          border: `1px solid ${payStyle.color}55`,
                          borderRadius: '20px', padding: '3px 10px',
                          fontSize: '10px', fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        {payStatus} â†“
                      </button>
                      {paymentPopup === r.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '30px', zIndex: 200,
                          background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                          overflow: 'hidden', minWidth: '120px'
                        }}>
                          {['Paid', 'Unpaid', 'Partial'].map(p => {
                            const ps = PAYMENT_STYLE[p] || PAYMENT_STYLE['Unpaid']
                            return (
                              <button
                                key={p}
                                onClick={e => { e.stopPropagation(); updatePayment(r.id, p) }}
                                style={{
                                  display: 'block', width: '100%', padding: '9px 14px',
                                  background: payStatus === p ? ps.bg : '#1a1c24',
                                  color: ps.color, border: 'none', fontSize: '12px',
                                  fontWeight: payStatus === p ? 700 : 500,
                                  cursor: 'pointer', textAlign: 'left',
                                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                                }}
                              >
                                {payStatus === p ? 'âœ“ ' : ''}{p}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Vehicle</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: '2px 0 0' }}>{vehName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Amount</p>
                  <p style={{ fontSize: '14px', color: '#4ade80', fontWeight: 800, margin: '2px 0 0' }}>{formatKES(r.amount || 0)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Booked On</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{formatDateTime(r.created)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Trip Date</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{formatTripDate(r.date, r.time)}</p>
                </div>
                {r.pickup_location && (
                  <div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Pickup</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{r.pickup_location}</p>
                  </div>
                )}
                {r.expand?.driver && (
                  <div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Driver</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{r.expand.driver.name}</p>
                  </div>
                )}
                {r.notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Notes</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', fontStyle: 'italic' }}>{r.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                padding: '10px 16px', background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex',
                gap: '8px', borderRadius: '0 0 14px 14px'
              }}>
                <Link href={`/reservations/${r.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '7px', background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Edit
                  </button>
                </Link>
                <Link href={`/reservations/${r.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '7px', background: '#2563eb',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    View
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
