'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useVehicles } from '@/hooks/useVehicles'
import { VEHICLE_STATUSES } from '@/lib/constants'

export default function NewVehiclePage() {
  const router = useRouter()
  const { createVehicle } = useVehicles()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    plate: '',
    status: 'Available',
    daily_rate: '',
    notes: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createVehicle({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        plate: form.plate,
        status: form.status as 'Available' | 'On Trip' | 'In Service',
        daily_rate: Number(form.daily_rate),
        notes: form.notes || undefined,
      })
      router.push('/fleet')
    } catch (err) {
      console.error('Failed to create vehicle:', err)
      alert('Failed to create vehicle. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    color: '#0f172a',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500 as const,
    color: '#334155',
    marginBottom: '6px',
  }

  return (
    <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Add Vehicle</h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Fill in the vehicle details below</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Make *</label>
            <input type='text' name='make' value={form.make} onChange={handleChange} required placeholder='e.g Toyota'
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
          </div>
          <div>
            <label style={labelStyle}>Model *</label>
            <input type='text' name='model' value={form.model} onChange={handleChange} required placeholder='e.g Prado'
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Year *</label>
            <input type='number' name='year' value={form.year} onChange={handleChange} required placeholder='e.g 2022'
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
          </div>
          <div>
            <label style={labelStyle}>Number Plate *</label>
            <input type='text' name='plate' value={form.plate} onChange={handleChange} required placeholder='e.g KDA 001A'
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Daily Rate (KES) *</label>
            <input type='number' name='daily_rate' value={form.daily_rate} onChange={handleChange} required placeholder='e.g 8000'
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select name='status' value={form.status} onChange={handleChange}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              {VEHICLE_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea name='notes' value={form.notes} onChange={handleChange} rows={3} placeholder='Any additional notes...'
            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
            onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
        </div>

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button type='submit' disabled={saving}
            style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Vehicle'}
          </button>
          <button type='button' onClick={() => router.push('/fleet')}
            style={{ padding: '10px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
