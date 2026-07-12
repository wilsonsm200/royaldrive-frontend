'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useReservations } from '@/hooks/useReservations'
import Button from '@/components/Button'
import { SERVICE_TYPES, RESERVATION_STATUSES } from '@/lib/constants'
import { db } from '@/lib/db'

export default function NewReservationPage() {
  const router = useRouter()
  const { createReservation } = useReservations()
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [form, setForm] = useState({
    customer: '',
    service_type: '',
    pickup_location: '',
    destination: '',
    date: '',
    end_date: '',
    time: '',
    vehicle: '',
    driver: '',
    amount: '',
    status: 'pending',
    notes: ''
  })

  useEffect(() => {
    async function loadFormData() {
      try {
        const [customersData, vehiclesData, driversData] = await Promise.all([
          db.getCustomers(),
          db.getVehicles(),
          db.getDrivers()
        ])
        setCustomers(customersData)
        setVehicles(vehiclesData)
        setDrivers(driversData)
      } catch (err) {
        console.error('Failed to load form data:', err)
      } finally {
        setLoadingData(false)
      }
    }
    loadFormData()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createReservation({
        customer: form.customer,
        service_type: form.service_type as 'Airport Transfer' | 'Chauffeur' | 'Self-Drive' | 'Wedding' | 'Long Distance',
        pickup_location: form.pickup_location,
        destination: form.destination,
        date: form.end_date ? `${form.date}|${form.end_date}` : form.date,
        time: form.time,
        vehicle: form.vehicle,
        driver: form.driver || undefined,
        amount: Number(form.amount),
        status: form.status as 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled',
        notes: form.notes || undefined,
      })
      router.push('/reservations')
    } catch (err) {
      console.error('Failed to create reservation:', err)
      alert('Failed to create reservation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading form data...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>New Reservation</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Customer */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Customer *
          </label>
          <select
            name='customer'
            value={form.customer}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <option value='' style={{ color: '#0f172a', background: '#fff' }}>Select customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id} style={{ color: '#0f172a', background: '#fff' }}>{c.name} — {c.phone}</option>
            ))}
          </select>
        </div>

        {/* Service Type */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Service Type *
          </label>
          <select
            name='service_type'
            value={form.service_type}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <option value='' style={{ color: '#0f172a', background: '#fff' }}>Select service type...</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s.toLowerCase()} style={{ color: '#0f172a', background: '#fff' }}>{s}</option>
            ))}
          </select>
        </div>

        {/* Pickup Location */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Pickup Location *
          </label>
          <input
            type='text'
            name='pickup_location'
            value={form.pickup_location}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Destination */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Destination *
          </label>
          <input
            type='text'
            name='destination'
            value={form.destination}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Date and Time - 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
              Date *
            </label>
            <input
              type='date'
              name='date'
              value={form.date}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
              End Date (optional)
            </label>
            <input
              type='date'
              name='end_date'
              value={form.end_date}
              onChange={handleChange}
              min={form.date}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
              Time *
            </label>
            <input
              type='time'
              name='time'
              value={form.time}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        {/* Vehicle */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Vehicle *
          </label>
          <select
            name='vehicle'
            value={form.vehicle}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <option value='' style={{ color: '#0f172a', background: '#fff' }}>Select vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id} style={{ color: '#0f172a', background: '#fff' }}>{v.make} {v.model} — {v.plate}</option>
            ))}
          </select>
        </div>

        {/* Driver (optional) */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Driver (Optional)
          </label>
          <select
            name='driver'
            value={form.driver}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <option value='' style={{ color: '#0f172a', background: '#fff' }}>No driver assigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id} style={{ color: '#0f172a', background: '#fff' }}>{d.name} — {d.phone}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Amount (KES) *
          </label>
          <input
            type='number'
            name='amount'
            value={form.amount}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Status
          </label>
          <select
            name='status'
            value={form.status}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff', colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            {RESERVATION_STATUSES.map((s) => (
              <option key={s} value={s.toLowerCase()} style={{ color: '#0f172a', background: '#fff' }}>{s}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Notes
          </label>
          <textarea
            name='notes'
            value={form.notes}
            onChange={handleChange}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none', color: '#0f172a', background: '#fff',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button
            type='submit'
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Reservation'}
          </button>
          <button
            type='button'
            onClick={() => router.push('/reservations')}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}