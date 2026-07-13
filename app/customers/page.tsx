'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { formatKES } from '@/lib/utils'
import { SERVICE_TYPES } from '@/lib/constants'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#16a34a', '#0891b2']

// Shared column template for the header + each row
const GRID_COLS = 'minmax(160px,1.6fr) minmax(140px,1.4fr) minmax(90px,1fr) 90px 110px 80px 190px'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', location: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingResId, setEditingResId] = useState<string | null>(null)
  const [editResForm, setEditResForm] = useState({ status: '', amount: '', notes: '' })
  const [bookingForm, setBookingForm] = useState({
    service_type: '', destination: '', vehicle: '',
    start_date: '', end_date: '', amount: '', status: 'Pending', notes: ''
  })
  const [bookingSaving, setBookingSaving] = useState(false)

  async function load() {
    const [custs, res, vehs] = await Promise.all([
      db.getCustomers(),
      db.getReservations(),
      db.getVehicles(),
    ])
    setCustomers(custs)
    setReservations(res)
    setVehicles(vehs)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function getStats(id: string) {
    const res = reservations.filter(r => r.customer === id)
    const active = res.filter(r => !['cancelled', 'Cancelled'].includes(r.status))
    const totalSpent = active.reduce((s, r) => s + (r.amount || 0), 0)
    const last = res[0]?.created || null
    const onTrip = res.find(r => ['in progress', 'In Progress', 'Confirmed', 'confirmed'].includes(r.status))
    return { count: res.length, totalSpent, last, onTrip, res }
  }

  function recalcAmount(start: string, end: string, vehicleId: string) {
    if (!start || !end || !vehicleId) return
    const days = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
    const veh = vehicles.find(v => v.id === vehicleId)
    if (veh && veh.daily_rate) {
      setBookingForm(f => ({ ...f, amount: String(days * Number(veh.daily_rate)) }))
    }
  }

  async function saveBooking(customerId: string) {
    setBookingSaving(true)
    await db.createReservation({
      customer: customerId,
      service_type: bookingForm.service_type,
      destination: bookingForm.destination,
      vehicle: bookingForm.vehicle || '',
      amount: Number(bookingForm.amount),
      status: bookingForm.status,
      notes: bookingForm.notes,
    })
    setBookingSaving(false)
    setBookingId(null)
    load()
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    await db.updateCustomer(editingId, editForm)
    setSaving(false)
    setEditingId(null)
    load()
  }

  async function saveResEdit() {
    if (!editingResId) return
    await db.updateReservation(editingResId, {
      status: editResForm.status,
      amount: Number(editResForm.amount),
      notes: editResForm.notes,
    })
    setEditingResId(null)
    load()
  }

  const filtered = customers.filter(c => {
    const name = (c.name || '').toLowerCase()
    const phone = String(c.phone || '').toLowerCase()
    const s = search.toLowerCase()
    return name.includes(s) || phone.includes(s)
  })

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center' }}>Loading...</p>

  return (
    <div style={{ padding: '20px 24px', fontFamily: 'Inter, sans-serif', background: '#0a0c10', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{customers.length} total customers</p>
        </div>
        <button onClick={() => router.push('/customers/new')}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          + New Customer
        </button>
      </div>

      {/* Search */}
      <input
        placeholder='ðŸ”  Search by name or phone...'
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '300px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff', marginBottom: '16px' }}
      />

      {/* Table */}
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', background: '#12141c' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '12px', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Customer', 'Contact', 'Location', 'Bookings', 'Total Spent', 'Last', 'Actions'].map((h, i) => (
            <span key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: (i >= 3 && i <= 5) || i === 6 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>

        {/* Scrollable rows */}
        <div style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '20px 16px' }}>No customers found</p>
        )}

        {filtered.map((c, idx) => {
          const { count, totalSpent, last, onTrip, res: custRes } = getStats(c.id)
          const name = c.name || 'Unknown'
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
          const isBooking = bookingId === c.id
          const isExpanded = expandedId === c.id
          const isEditing = editingId === c.id
          const open = isBooking || isExpanded || isEditing

          return (
            <div key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: open ? 'rgba(255,255,255,0.02)' : 'transparent' }}>

              {/* Row */}
              <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '12px', padding: '10px 16px', alignItems: 'center' }}>
                {/* Customer */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '9px',
                    background: avatarColor, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {initials(name)}
                  </div>
                  <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                    {onTrip
                      ? <span style={{ background: 'rgba(234,88,12,0.15)', color: '#f97316', border: '1px solid rgba(234,88,12,0.3)', borderRadius: '20px', padding: '1px 6px', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>ON TRIP</span>
                      : <span style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px', padding: '1px 6px', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>FREE</span>
                    }
                  </div>
                </div>
                {/* Contact */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.phone || '-'}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email || ''}</p>
                </div>
                {/* Location */}
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.location || '-'}</p>
                {/* Bookings (clickable) */}
                <p onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', margin: 0, textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                  {count} {isExpanded ? '▲' : '▼'}
                </p>
                {/* Total Spent */}
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', margin: 0, textAlign: 'right' }}>{formatKES(totalSpent)}</p>
                {/* Last */}
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'right', whiteSpace: 'nowrap' }}>{last ? timeAgo(last) : '-'}</p>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setBookingId(isBooking ? null : c.id); setEditingId(null); setExpandedId(null) }}
                    style={{ padding: '5px 10px', background: isBooking ? '#dc2626' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {isBooking ? 'Cancel' : '+ Book'}
                  </button>
                  <button onClick={() => { setEditingId(isEditing ? null : c.id); setBookingId(null); setExpandedId(null); setEditForm({ name: c.name || '', phone: String(c.phone || ''), email: c.email || '', location: c.location || '', notes: c.notes || '' }) }}
                    style={{ padding: '5px 10px', background: isEditing ? '#dc2626' : 'rgba(255,255,255,0.08)', color: isEditing ? '#fff' : 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {isEditing ? 'Close' : 'Edit'}
                  </button>
                  <button onClick={() => router.push('/customers/' + c.id)}
                    style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    View
                  </button>
                </div>
              </div>

              {/* Expanded Bookings */}
              {isExpanded && (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {custRes.length === 0
                    ? <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', padding: '12px 16px' }}>No bookings yet</p>
                    : custRes.map(r => (
                      <div key={r.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {editingResId === r.id ? (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Status</label>
                              <select value={editResForm.status} onChange={e => setEditResForm(f => ({ ...f, status: e.target.value }))}
                                style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', background: '#1a1c24', color: '#fff' }}>
                                {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Amount</label>
                              <input value={editResForm.amount} onChange={e => setEditResForm(f => ({ ...f, amount: e.target.value }))} type='number'
                                style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', width: '90px', background: '#1a1c24', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Notes</label>
                              <input value={editResForm.notes} onChange={e => setEditResForm(f => ({ ...f, notes: e.target.value }))}
                                style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', width: '120px', background: '#1a1c24', color: '#fff' }} />
                            </div>
                            <button onClick={saveResEdit} style={{ padding: '5px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                            <button onClick={() => setEditingResId(null)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', margin: 0 }}>{r.service_type || '-'} â†’ {r.destination || '-'}</p>
                              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{formatKES(r.amount || 0)} Â· {timeAgo(r.created)}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                background: ['completed','Completed'].includes(r.status) ? 'rgba(34,197,94,0.15)' : ['cancelled','Cancelled'].includes(r.status) ? 'rgba(239,68,68,0.15)' : ['in progress','In Progress'].includes(r.status) ? 'rgba(234,88,12,0.15)' : 'rgba(59,130,246,0.15)',
                                color: ['completed','Completed'].includes(r.status) ? '#4ade80' : ['cancelled','Cancelled'].includes(r.status) ? '#f87171' : ['in progress','In Progress'].includes(r.status) ? '#f97316' : '#60a5fa',
                              }}>{r.status}</span>
                              <button onClick={() => { setEditingResId(r.id); setEditResForm({ status: r.status, amount: String(r.amount || ''), notes: r.notes || '' }) }}
                                style={{ color: '#60a5fa', background: 'none', border: 'none', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Inline Edit Customer Form */}
              {isEditing && (
                <div style={{ padding: '14px 16px', background: 'rgba(37,99,235,0.1)', borderBottom: '1px solid rgba(37,99,235,0.2)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', marginBottom: '10px' }}>Edit Customer</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {[
                      { label: 'Full Name', name: 'name' },
                      { label: 'Phone', name: 'phone' },
                      { label: 'Email', name: 'email' },
                      { label: 'Location', name: 'location' },
                      { label: 'Notes', name: 'notes' },
                    ].map(f => (
                      <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{f.label}</label>
                        <input name={f.name} value={(editForm as any)[f.name]}
                          onChange={e => setEditForm(f2 => ({ ...f2, [e.target.name]: e.target.value }))}
                          style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', outline: 'none', background: '#1a1c24', color: '#fff' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={saveEdit} disabled={saving} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Inline Booking Form */}
              {isBooking && (
                <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80', marginBottom: '10px' }}>New Booking for {name}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Service Type</label>
                      <select value={bookingForm.service_type} onChange={e => setBookingForm(f => ({ ...f, service_type: e.target.value }))}
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', background: '#1a1c24', color: '#fff' }}>
                        <option value=''>Select service...</option>
                        {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Destination</label>
                      <input value={bookingForm.destination} onChange={e => setBookingForm(f => ({ ...f, destination: e.target.value }))}
                        placeholder='e.g. JKIA, Nakuru...'
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', outline: 'none', background: '#1a1c24', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Vehicle</label>
                      <select value={bookingForm.vehicle} onChange={e => { setBookingForm(f => ({ ...f, vehicle: e.target.value })); recalcAmount(bookingForm.start_date, bookingForm.end_date, e.target.value) }}
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', background: '#1a1c24', color: '#fff' }}>
                        <option value=''>Select vehicle...</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate})</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Start Date</label>
                      <input type='date' value={bookingForm.start_date}
                        onChange={e => { setBookingForm(f => ({ ...f, start_date: e.target.value })); recalcAmount(e.target.value, bookingForm.end_date, bookingForm.vehicle) }}
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', outline: 'none', background: '#1a1c24', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>End Date</label>
                      <input type='date' value={bookingForm.end_date}
                        onChange={e => { setBookingForm(f => ({ ...f, end_date: e.target.value })); recalcAmount(bookingForm.start_date, e.target.value, bookingForm.vehicle) }}
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', outline: 'none', background: '#1a1c24', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Amount (KES)</label>
                      <input type='number' value={bookingForm.amount} onChange={e => setBookingForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder='0'
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', outline: 'none', fontWeight: 600, background: '#1a1c24', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Status</label>
                      <select value={bookingForm.status} onChange={e => setBookingForm(f => ({ ...f, status: e.target.value }))}
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', background: '#1a1c24', color: '#fff' }}>
                        {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Notes</label>
                      <input value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder='Optional...'
                        style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', outline: 'none', background: '#1a1c24', color: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => saveBooking(c.id)} disabled={bookingSaving || !bookingForm.service_type || !bookingForm.destination}
                      style={{ padding: '7px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {bookingSaving ? 'Saving...' : 'Confirm Booking'}
                    </button>
                    <button onClick={() => setBookingId(null)} style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
