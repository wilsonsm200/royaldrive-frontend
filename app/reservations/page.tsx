'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { formatKES } from '@/lib/utils'
import { RESERVATION_STATUSES } from '@/lib/constants'

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

// Shared column template for header + each row
const GRID_COLS = 'minmax(140px,1.4fr) minmax(170px,1.8fr) minmax(120px,1.2fr) minmax(110px,1fr) 100px 120px 110px 70px'

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Reservations</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{total} total bookings</p>
        </div>
        <Link href='/reservations/new' style={{ textDecoration: 'none' }}>
          <button style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            + New Reservation
          </button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Bookings', value: total,                   color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Active Trips',   value: active,                  color: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
          { label: 'Pending',        value: pending,                 color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Revenue',  value: formatKES(totalRevenue), color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '14px 16px', border: `1px solid ${s.color}33` }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search customer, destination, service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', background: '#1a1c24', color: '#fff', cursor: 'pointer' }}>
          <option value='All'>All Statuses</option>
          {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', background: '#1a1c24', color: '#fff', cursor: 'pointer' }}>
          <option value='All'>All Payments</option>
          {['Paid', 'Unpaid', 'Partial'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterStatus !== 'All' || filterPayment !== 'All') && (
          <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPayment('All') }}
            style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            Clear
          </button>
        )}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', background: '#12141c' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '12px', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Customer', 'Trip', 'Vehicle', 'Trip Date', 'Amount', 'Status', 'Payment', ''].map((h, i) => (
            <span key={i} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>

        {/* Scrollable rows */}
        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '20px 16px' }}>No reservations found</p>
          )}

          {filtered.map(r => {
            const cust = customers[r.customer]
            const custName = cust?.name || cust?.Name || r.expand?.customer?.name || '-'
            const vehName = vehicles[r.vehicle] || (r.expand?.vehicle ? `${r.expand.vehicle.make} ${r.expand.vehicle.model} (${r.expand.vehicle.plate})` : '-')
            const status = r.status || 'Pending'
            const statusStyle = STATUS_STYLE[status] || STATUS_STYLE['Pending']
            const payStatus = r.payment_status || 'Unpaid'
            const payStyle = PAYMENT_STYLE[payStatus] || PAYMENT_STYLE['Unpaid']

            return (
              <div key={r.id} onClick={e => e.stopPropagation()}
                style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '12px', padding: '10px 16px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Customer */}
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{custName}</p>
                {/* Trip */}
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.service_type || '-'} &rarr; <span style={{ color: '#fff', fontWeight: 600 }}>{r.destination || '-'}</span>
                </p>
                {/* Vehicle */}
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vehName}</p>
                {/* Trip Date */}
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatTripDate(r.date, r.time)}</p>
                {/* Amount */}
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80', margin: 0, textAlign: 'right' }}>{formatKES(r.amount || 0)}</p>
                {/* Status dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={e => { e.stopPropagation(); setStatusPopup(statusPopup === r.id ? null : r.id); setPaymentPopup(null) }}
                    style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {status} &darr;
                  </button>
                  {statusPopup === r.id && (
                    <div style={{ position: 'absolute', left: 0, top: '30px', zIndex: 200, background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', overflow: 'hidden', minWidth: '150px' }}>
                      {RESERVATION_STATUSES.map(s => {
                        const st = STATUS_STYLE[s] || STATUS_STYLE['Pending']
                        return (
                          <button key={s} onClick={e => { e.stopPropagation(); updateStatus(r.id, s) }}
                            style={{ display: 'block', width: '100%', padding: '9px 14px', background: status === s ? st.bg : '#1a1c24', color: st.color, border: 'none', fontSize: '12px', fontWeight: status === s ? 700 : 500, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {status === s ? '✓ ' : ''}{s}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {/* Payment dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={e => { e.stopPropagation(); setPaymentPopup(paymentPopup === r.id ? null : r.id); setStatusPopup(null) }}
                    style={{ background: payStyle.bg, color: payStyle.color, border: `1px solid ${payStyle.color}55`, borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {payStatus} &darr;
                  </button>
                  {paymentPopup === r.id && (
                    <div style={{ position: 'absolute', left: 0, top: '30px', zIndex: 200, background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', overflow: 'hidden', minWidth: '120px' }}>
                      {['Paid', 'Unpaid', 'Partial'].map(p => {
                        const ps = PAYMENT_STYLE[p] || PAYMENT_STYLE['Unpaid']
                        return (
                          <button key={p} onClick={e => { e.stopPropagation(); updatePayment(r.id, p) }}
                            style={{ display: 'block', width: '100%', padding: '9px 14px', background: payStatus === p ? ps.bg : '#1a1c24', color: ps.color, border: 'none', fontSize: '12px', fontWeight: payStatus === p ? 700 : 500, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {payStatus === p ? '✓ ' : ''}{p}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {/* View */}
                <Link href={`/reservations/${r.id}`} style={{ textAlign: 'right', textDecoration: 'none' }}>
                  <span style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View</span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
