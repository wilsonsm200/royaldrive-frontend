'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useParams, useRouter } from 'next/navigation'
import { useVehicle } from '@/hooks/useVehicles'
import Button from '@/components/Button'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'
import { VEHICLE_STATUSES } from '@/lib/constants'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { vehicle, loading, updateVehicle } = useVehicle(id as string)
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>(null)

  function startEdit() {
    setForm({
      make: vehicle!.make,
      model: vehicle!.model,
      year: String(vehicle!.year),
      plate: vehicle!.plate,
      status: vehicle!.status,
      daily_rate: String(vehicle!.daily_rate ?? ''),
      notes: vehicle!.notes ?? '',
      color: vehicle!.color ?? '',
      seats: String(vehicle!.seats ?? ''),
    })
    setEditing(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateVehicle({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        plate: form.plate,
        status: form.status,
        daily_rate: Number(form.daily_rate),
        notes: form.notes || undefined,
        color: form.color,
        seats: Number(form.seats),
      })
      setEditing(false)
    } catch (err) {
      alert('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading vehicle details...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Vehicle not found</p>
        <button onClick={() => router.push('/fleet')}
          style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Fleet
        </button>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#0f172a', background: '#fff',
  }

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#fff' }}>
          {vehicle.make} {vehicle.model}
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit}
                style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Edit
              </button>
              <Button variant='secondary' onClick={() => router.push('/fleet')}>Back</Button>
            </>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Make</p>
            {editing ? <input name='make' value={form.make} onChange={handleChange} style={inputStyle} /> :
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{vehicle.make}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Model</p>
            {editing ? <input name='model' value={form.model} onChange={handleChange} style={inputStyle} /> :
              <p style={{ fontSize: '14px', color: '#0f172a' }}>{vehicle.model}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Plate Number</p>
            {editing ? <input name='plate' value={form.plate} onChange={handleChange} style={inputStyle} /> :
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{vehicle.plate}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Year</p>
            {editing ? <input name='year' type='number' value={form.year} onChange={handleChange} style={inputStyle} /> :
              <p style={{ fontSize: '14px', color: '#0f172a' }}>{vehicle.year}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Daily Rate</p>
            {editing ? <input name='daily_rate' type='number' value={form.daily_rate} onChange={handleChange} style={inputStyle} /> :
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{vehicle.daily_rate ? formatKES(vehicle.daily_rate) : '-'}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Status</p>
            {editing ? (
              <select name='status' value={form.status} onChange={handleChange}
                style={{ ...inputStyle, background: '#fff' }}>
                {VEHICLE_STATUSES.map(s => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </select>
            ) : <PaymentBadge status={vehicle.status} />}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Color</p>
            {editing ? <input name='color' value={form.color} onChange={handleChange} style={inputStyle} placeholder='e.g Silver' /> :
              <p style={{ fontSize: '14px', color: '#0f172a' }}>{vehicle.color || '-'}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Seats</p>
            {editing ? <input name='seats' type='number' value={form.seats} onChange={handleChange} style={inputStyle} placeholder='e.g 5' /> :
              <p style={{ fontSize: '14px', color: '#0f172a' }}>{vehicle.seats ? vehicle.seats + ' seats' : '-'}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Added to Fleet</p>
            <p style={{ fontSize: '14px', color: '#475569' }}>{formatDate(vehicle.created)}</p>
          </div>

          {(editing || vehicle.notes) && (
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Notes</p>
              {editing ? (
                <textarea name='notes' value={form.notes} onChange={handleChange} rows={3}
                  style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} />
              ) : <p style={{ fontSize: '14px', color: '#475569' }}>{vehicle.notes}</p>}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
