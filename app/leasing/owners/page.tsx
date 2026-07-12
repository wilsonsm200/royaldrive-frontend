'use client'
import { useState } from 'react'
import { useLeasingOwners } from '@/hooks/useLeasingOwners'
import Button from '@/components/Button'
import { formatDate } from '@/lib/utils'

export default function LeasingOwnersPage() {
  const { owners, loading, error, createOwner, reload } = useLeasingOwners()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    id_number: '',
    notes: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createOwner(form)
      setShowForm(false)
      setForm({ name: '', phone: '', email: '', id_number: '', notes: '' })
    } catch (err) {
      console.error('Failed to create owner:', err)
      alert('Failed to create owner. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && owners.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading owners...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
        <p style={{ color: '#f87171' }}>Error: {error}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#0a0c10', minHeight: '100vh', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Car Owners</h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{owners.length} total owners</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Owner</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>New Car Owner</h2>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Full Name *</label>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Phone *</label>
            <input
              type='tel'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Email</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>ID Number</label>
            <input
              type='text'
              name='id_number'
              value={form.id_number}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Notes</label>
            <textarea
              name='notes'
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type='submit'
              disabled={saving}
              style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Owner'}
            </button>
            <button
              type='button'
              onClick={() => setShowForm(false)}
              style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                {['Name', 'Phone', 'Email', 'ID Number', 'Added'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {owners.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px', fontSize: '13px' }}>No owners yet</td></tr>
              )}
              {owners.map((o) => (
                <tr key={o.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px', color: '#fff' }}>{o.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{o.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{o.email || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{o.id_number || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{formatDate(o.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}