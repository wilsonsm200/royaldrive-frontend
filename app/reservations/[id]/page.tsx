'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { formatKES, formatDate } from '@/lib/utils'
import { SERVICE_TYPES, RESERVATION_STATUSES } from '@/lib/constants'

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Pending':     { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Confirmed':   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'In Progress': { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Completed':   { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  'Cancelled':   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

const PAYMENT_STYLE: Record<string, { bg: string; color: string }> = {
  'Paid':    { bg: '#f0fdf4', color: '#16a34a' },
  'Unpaid':  { bg: '#fef2f2', color: '#dc2626' },
  'Partial': { bg: '#fff7ed', color: '#d97706' },
}

const labelStyle = {
  fontSize: '11px', fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px'
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
  borderRadius: '8px', fontSize: '13px', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const,
  color: '#0f172a', colorScheme: 'light' as const,
}

function formatTripDate(date: string, time: string) {
  if (!date) return '-'
  const parts = date.split('|')
  const s = parts[0]
  const e = parts[1]
  if (e) {
    const days = Math.round((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return s + ' to ' + e + ' (' + days + ' day' + (days > 1 ? 's' : '') + ')'
  }
  return s + (time ? ' at ' + time : '')
}

export default function ReservationDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [reservation, setReservation] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    customer: '', service_type: '', pickup_location: '',
    destination: '', date: '', end_date: '', time: '', vehicle: '',
    driver: '', amount: '', status: 'Pending',
    payment_status: 'Unpaid', notes: '',
  })

  async function load() {
    try {
      const [res, custs, vehs, drvs] = await Promise.all([
        db.getReservation(id as string),
        db.getCustomers(),
        db.getVehicles(),
        db.getDrivers(),
      ])
      setReservation(res)
      setCustomers(custs)
      setVehicles(vehs)
      setDrivers(drvs)
      setForm({
        customer: res.customer || '',
        service_type: res.service_type || '',
        pickup_location: res.pickup_location || '',
        destination: res.destination || '',
        date: res.date?.split('|')[0] || '',
        end_date: res.date?.split('|')[1] || '',
        time: res.time || '',
        vehicle: res.vehicle || '',
        driver: res.driver || '',
        amount: String(res.amount || ''),
        status: res.status || 'Pending',
        payment_status: res.payment_status || 'Unpaid',
        notes: res.notes || '',
      })
    } catch (e) {
      console.error('Failed to load:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await db.updateReservation(id as string, {
        customer: form.customer,
        service_type: form.service_type,
        pickup_location: form.pickup_location,
        destination: form.destination,
        date: form.end_date ? `${form.date}|${form.end_date}` : form.date,
        time: form.time,
        vehicle: form.vehicle,
        driver: form.driver || null,
        amount: Number(form.amount),
        status: form.status,
        payment_status: form.payment_status,
        notes: form.notes,
      })
      await load()
      setEditing(false)
    } catch (e) {
      console.error('Failed to save:', e)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Loading reservation...</p>
    </div>
  )

  if (!reservation) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p style={{ color: '#dc2626' }}>Reservation not found</p>
      <button onClick={() => router.push('/reservations')}
        style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        Back to Reservations
      </button>
    </div>
  )

  const status = reservation.status || 'Pending'
  const statusStyle = STATUS_STYLE[status] || STATUS_STYLE['Pending']
  const payStatus = reservation.payment_status || 'Unpaid'
  const payStyle = PAYMENT_STYLE[payStatus] || PAYMENT_STYLE['Unpaid']

  const customerObj = customers.find(c => c.id === reservation.customer)
  const vehicleObj = vehicles.find(v => v.id === reservation.vehicle)
  const driverObj = drivers.find(d => d.id === reservation.driver)

  const vehicleName = vehicleObj ? `${vehicleObj.make} ${vehicleObj.model} (${vehicleObj.plate})` : '-'

  return (
    <div style={{ maxWidth: '800px', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Reservation #{(id as string).slice(-8).toUpperCase()}
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
            Created {formatDate(reservation.created)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Edit
            </button>
          )}
          <button
            onClick={() => router.push('/reservations')}
            style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
          >
            Back
          </button>
        </div>
      </div>

      {/* VIEW MODE */}
      {!editing && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>

          {/* Status bar */}
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ ...statusStyle, border: `1px solid ${statusStyle.border}`, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 700 }}>
              {status}
            </span>
            <span style={{ background: payStyle.bg, color: payStyle.color, border: `1px solid ${payStyle.color}44`, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 700 }}>
              {payStatus}
            </span>
          </div>

          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
            {[
              { label: 'Customer', value: customerObj?.name || '-' },
              { label: 'Service Type', value: reservation.service_type || '-' },
              { label: 'Pickup Location', value: reservation.pickup_location || '-' },
              { label: 'Destination', value: reservation.destination || '-' },
              { label: 'Trip Date', value: formatTripDate(reservation.date, reservation.time) },
              { label: 'Vehicle', value: vehicleName },
              { label: 'Driver', value: driverObj?.name || 'Not assigned' },
              { label: 'Amount', value: formatKES(reservation.amount || 0) },
            ].map(f => (
              <div key={f.label}>
                <p style={labelStyle}>{f.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{f.value}</p>
              </div>
            ))}
            {reservation.notes && (
              <div style={{ gridColumn: 'span 2' }}>
                <p style={labelStyle}>Notes</p>
                <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontStyle: 'italic' }}>{reservation.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', margin: 0 }}>Editing Reservation</p>

          {/* Customer */}
          <div>
            <p style={labelStyle}>Customer</p>
            <select name='customer' value={form.customer} onChange={handleChange} required style={inputStyle}>
              <option value=''>Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id} style={{ color: '#0f172a', background: '#fff' }}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          {/* Service Type */}
          <div>
            <p style={labelStyle}>Service Type</p>
            <select name='service_type' value={form.service_type} onChange={handleChange} style={inputStyle}>
              <option value=''>Select service...</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s} style={{ color: '#0f172a', background: '#fff' }}>{s}</option>)}
            </select>
          </div>

          {/* Pickup + Destination */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={labelStyle}>Pickup Location</p>
              <input name='pickup_location' value={form.pickup_location} onChange={handleChange} style={inputStyle} placeholder='e.g. Muranga Town' />
            </div>
            <div>
              <p style={labelStyle}>Destination</p>
              <input name='destination' value={form.destination} onChange={handleChange} required style={inputStyle} placeholder='e.g. JKIA' />
            </div>
          </div>

          {/* Date + End Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <p style={labelStyle}>Trip Date</p>
              <input type='date' name='date' value={form.date} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <p style={labelStyle}>End Date (optional)</p>
              <input type='date' name='end_date' value={form.end_date} onChange={handleChange} style={inputStyle} min={form.date} />
            </div>
            <div>
              <p style={labelStyle}>Trip Time</p>
              <input type='time' name='time' value={form.time} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Vehicle */}
          <div>
            <p style={labelStyle}>Vehicle</p>
            <select name='vehicle' value={form.vehicle} onChange={handleChange} style={inputStyle}>
              <option value=''>Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id} style={{ color: '#0f172a', background: '#fff' }}>{v.make} {v.model} — {v.plate}</option>)}
            </select>
          </div>

          {/* Driver */}
          <div>
            <p style={labelStyle}>Driver (Optional)</p>
            <select name='driver' value={form.driver} onChange={handleChange} style={inputStyle}>
              <option value=''>No driver assigned</option>
              {drivers.map(d => <option key={d.id} value={d.id} style={{ color: '#0f172a', background: '#fff' }}>{d.name} — {d.phone}</option>)}
            </select>
          </div>

          {/* Amount */}
          <div>
            <p style={labelStyle}>Amount (KES)</p>
            <input type='number' name='amount' value={form.amount} onChange={handleChange} required style={inputStyle} placeholder='0' />
          </div>

          {/* Status + Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={labelStyle}>Reservation Status</p>
              <select name='status' value={form.status} onChange={handleChange} style={inputStyle}>
                {RESERVATION_STATUSES.map(s => <option key={s} value={s} style={{ color: '#0f172a', background: '#fff' }}>{s}</option>)}
              </select>
            </div>
            <div>
              <p style={labelStyle}>Payment Status</p>
              <select name='payment_status' value={form.payment_status} onChange={handleChange} style={inputStyle}>
                {['Paid', 'Unpaid', 'Partial'].map(s => <option key={s} value={s} style={{ color: '#0f172a', background: '#fff' }}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p style={labelStyle}>Notes</p>
            <textarea name='notes' value={form.notes} onChange={handleChange} rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder='Optional notes...' />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type='submit' disabled={saving}
              style={{ padding: '10px 24px', background: saving ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type='button' onClick={() => setEditing(false)}
              style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '9px', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>

        </form>
      )}

    </div>
  )
}