'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDrivers } from '@/hooks/useDrivers'

const AVAILABILITY_OPTIONS = ['Available', 'On Trip', 'Off Duty']

export default function NewDriverPage() {
  const router = useRouter()
  const { createDriver } = useDrivers()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    availability: 'Available' as 'Available' | 'On Trip' | 'Off Duty',
    notes: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const value = e.target.name === 'availability' 
      ? e.target.value as 'Available' | 'On Trip' | 'Off Duty'
      : e.target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createDriver({
        name: form.name,
        phone: form.phone,
        license_number: form.license_number,
        license_expiry: form.license_expiry || undefined,
        availability: form.availability,
        notes: form.notes || undefined,
      })
      router.push('/drivers')
    } catch (err) {
      console.error('Failed to create driver:', err)
      alert('Failed to create driver. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>Add Driver</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Full Name *
          </label>
          <input
            type='text'
            name='name'
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              color: '#0f172a',
              background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Phone *
          </label>
          <input
            type='tel'
            name='phone'
            value={form.phone}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              color: '#0f172a',
              background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            License Number
          </label>
          <input
            type='text'
            name='license_number'
            value={form.license_number}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              color: '#0f172a',
              background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            License Expiry Date
          </label>
          <input
            type='date'
            name='license_expiry'
            value={form.license_expiry}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              color: '#0f172a',
              background: '#fff',
              colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Availability
          </label>
          <select
            name='availability'
            value={form.availability}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              color: '#0f172a',
              colorScheme: 'light',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            {AVAILABILITY_OPTIONS.map(opt => (
              <option key={opt} value={opt} style={{ color: '#0f172a', background: '#fff' }}>{opt}</option>
            ))}
          </select>
        </div>

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
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
              color: '#0f172a',
              background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

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
            {saving ? 'Saving...' : 'Save Driver'}
          </button>
          <button
            type='button'
            onClick={() => router.push('/drivers')}
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