'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLeasingContracts } from '@/hooks/useLeasingContracts'
import Button from '@/components/Button'
import { PAYOUT_FREQUENCIES } from '@/lib/constants'
import { db } from '@/lib/db'

export default function NewLeasingPage() {
  const router = useRouter()
  const { createContract } = useLeasingContracts()
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [owners, setOwners] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  
  const [form, setForm] = useState({
    owner: '',
    vehicle: '',
    start_date: '',
    payout_frequency: 'monthly',
    payout_amount: '',
    status: 'active',
    notes: ''
  })

  useEffect(() => {
    async function loadFormData() {
      try {
        const [ownersData, vehiclesData] = await Promise.all([
          db.getLeasingOwners(),
          db.getVehicles()
        ])
        setOwners(ownersData)
        setVehicles(vehiclesData)
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
      await createContract({
        owner: form.owner,
        vehicle: form.vehicle,
        start_date: form.start_date || undefined,
        payout_frequency: form.payout_frequency as 'Weekly' | 'Monthly',
        payout_amount: Number(form.payout_amount),
        status: form.status as 'Active' | 'Ended',
        notes: form.notes || undefined,
      })
      router.push('/leasing')
    } catch (err) {
      console.error('Failed to create contract:', err)
      alert('Failed to create contract. Please try again.')
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
    <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a' }}>New Leasing Contract</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Car Owner *
          </label>
          <select
            name='owner'
            value={form.owner}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <option value=''>Select owner...</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name} â€” {o.phone}</option>
            ))}
          </select>
        </div>

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
              outline: 'none',
              background: '#fff',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <option value=''>Select vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.make} {v.model} â€” {v.plate}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Start Date
          </label>
          <input
            type='date'
            name='start_date'
            value={form.start_date}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Payout Amount (KES) *
          </label>
          <input
            type='number'
            name='payout_amount'
            value={form.payout_amount}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
            Payout Frequency *
          </label>
          <select
            name='payout_frequency'
            value={form.payout_frequency}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
            }}
          >
            {PAYOUT_FREQUENCIES.map((f) => (
              <option key={f} value={f.toLowerCase()}>{f}</option>
            ))}
          </select>
        </div>

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
              outline: 'none',
              background: '#fff',
            }}
          >
            <option value='active'>Active</option>
            <option value='expired'>Expired</option>
            <option value='terminated'>Terminated</option>
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
            }}
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
            {saving ? 'Saving...' : 'Save Contract'}
          </button>
          <button
            type='button'
            onClick={() => router.push('/leasing')}
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

