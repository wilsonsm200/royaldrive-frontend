'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { formatKES, formatDate } from '@/lib/utils'
import PaymentBadge from '@/components/PaymentBadge'

const FREQUENCY_OPTIONS = ['monthly', 'weekly']
const STATUS_OPTIONS = ['active', 'completed', 'cancelled']

function calcExpected(startDate: string, amount: number, frequency: string): number {
  const start = new Date(startDate)
  const now = new Date()
  if (start > now) return 0
  let periods = 0
  if (frequency === 'monthly') {
    periods = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (now.getDate() >= start.getDate()) periods += 1
  } else if (frequency === 'weekly') {
    periods = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  } else {
    periods = 1
  }
  return periods * amount
}

function getNextDueDate(startDate: string, frequency: string): string {
  const start = new Date(startDate)
  const now = new Date()
  if (frequency === 'monthly') {
    const next = new Date(now.getFullYear(), now.getMonth(), start.getDate())
    if (next <= now) next.setMonth(next.getMonth() + 1)
    return next.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return '-'
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
  colorScheme: 'light' as const,
}

export default function LeasingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [vehicle, setVehicle] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    owner: '',
    vehicle: '',
    payout_amount: '',
    payout_frequency: 'monthly',
    start_date: '',
    status: 'active',
    notes: '',
  })

  async function loadAll() {
    if (!id) return
    try {
      const c = await db.getLeasingContract(id as string)
      const [o, v, allPayments, allOwners, allVehicles] = await Promise.all([
        db.getLeasingOwner(c.owner),
        db.getVehicle(c.vehicle),
        db.getPayments({ category: 'Leasing Payout' }),
        db.getLeasingOwners(),
        db.getVehicles(),
      ])
      const pays = [...allPayments].sort((a: any, b: any) =>
        new Date(b.payment_date || b.created).getTime() - new Date(a.payment_date || a.created).getTime()
      )
      setContract(c)
      setOwner(o)
      setVehicle(v)
      setPayments(pays)
      setOwners(allOwners)
      setVehicles(allVehicles)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function startEdit() {
    if (!contract) return
    setForm({
      owner: contract.owner || '',
      vehicle: contract.vehicle || '',
      payout_amount: String(contract.payout_amount ?? ''),
      payout_frequency: contract.payout_frequency || 'monthly',
      start_date: contract.start_date ? contract.start_date.slice(0, 10) : '',
      status: contract.status || 'active',
      notes: contract.notes || '',
    })
    setEditing(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      await db.updateLeasingContract(id as string, {
        owner: form.owner,
        vehicle: form.vehicle,
        payout_amount: Number(form.payout_amount) || 0,
        payout_frequency: form.payout_frequency,
        start_date: form.start_date || null,
        status: form.status,
        notes: form.notes || undefined,
      })
      setEditing(false)
      await loadAll()
    } catch (err) {
      console.error('Failed to update contract:', err)
      alert('Failed to update contract. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: '#64748b' }}>Loading...</p></div>
  if (!contract) return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: '#dc2626' }}>Contract not found</p></div>

  const totalExpected = calcExpected(contract.start_date, contract.payout_amount, contract.payout_frequency)
  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const balance = totalExpected - totalPaid
  const nextDue = getNextDueDate(contract.start_date, contract.payout_frequency)

  const labelStyle = { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '4px' }
  const valueStyle = { fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '2px 0 0' }
  const formLabelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }

  return (
    <div style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Leasing Contract</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>{owner?.name || '-'} ? {vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!editing && (
            <button onClick={startEdit}
              style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Edit
            </button>
          )}
          <button onClick={() => router.push('/leasing')}
            style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Monthly Rate', value: formatKES(contract.payout_amount), color: '#2563eb', bg: '#eff6ff' },
          { label: 'Total Paid', value: formatKES(totalPaid), color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Balance Remaining', value: formatKES(balance), color: balance > 0 ? '#dc2626' : '#16a34a', bg: balance > 0 ? '#fef2f2' : '#f0fdf4' },
          { label: 'Next Due Date', value: nextDue, color: '#d97706', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '14px 16px', border: `1px solid ${s.color}33` }}>
            <p style={{ fontSize: '16px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contract Details / Edit Form */}
      {editing ? (
        <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Edit Contract</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={formLabelStyle}>Owner *</label>
              <select name='owner' value={form.owner} onChange={handleChange} required style={inputStyle}>
                <option value=''>Select owner</option>
                {owners.map((o: any) => (
                  <option key={o.id} value={o.id} style={{ color: '#0f172a', background: '#fff' }}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>Vehicle *</label>
              <select name='vehicle' value={form.vehicle} onChange={handleChange} required style={inputStyle}>
                <option value=''>Select vehicle</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id} style={{ color: '#0f172a', background: '#fff' }}>
                    {v.make} {v.model} ({v.plate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>Payout Amount *</label>
              <input
                type='number'
                name='payout_amount'
                value={form.payout_amount}
                onChange={handleChange}
                required
                min='0'
                step='0.01'
                style={inputStyle}
              />
            </div>

            <div>
              <label style={formLabelStyle}>Frequency *</label>
              <select name='payout_frequency' value={form.payout_frequency} onChange={handleChange} required style={inputStyle}>
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt} value={opt} style={{ color: '#0f172a', background: '#fff' }}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={formLabelStyle}>Start Date *</label>
              <input
                type='date'
                name='start_date'
                value={form.start_date}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={formLabelStyle}>Status *</label>
              <select name='status' value={form.status} onChange={handleChange} required style={inputStyle}>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt} style={{ color: '#0f172a', background: '#fff' }}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={formLabelStyle}>Notes</label>
            <textarea
              name='notes'
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' as const }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type='submit'
              disabled={saving}
              style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type='button'
              onClick={() => setEditing(false)}
              style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Contract Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div><p style={labelStyle}>Owner</p><p style={valueStyle}>{owner?.name || '-'}</p></div>
            <div><p style={labelStyle}>Phone</p><p style={valueStyle}>{owner?.phone || '-'}</p></div>
            <div><p style={labelStyle}>Vehicle</p><p style={valueStyle}>{vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}</p></div>
            <div><p style={labelStyle}>Plate</p><p style={valueStyle}>{vehicle?.plate || '-'}</p></div>
            <div><p style={labelStyle}>Payout Amount</p><p style={{ ...valueStyle, color: '#16a34a', fontSize: '16px' }}>{formatKES(contract.payout_amount)}</p></div>
            <div><p style={labelStyle}>Frequency</p><p style={valueStyle}>{contract.payout_frequency}</p></div>
            <div><p style={labelStyle}>Start Date</p><p style={valueStyle}>{formatDate(contract.start_date)}</p></div>
            <div><p style={labelStyle}>Status</p><PaymentBadge status={contract.status} /></div>
            {contract.notes && <div style={{ gridColumn: 'span 2' }}><p style={labelStyle}>Notes</p><p style={{ ...valueStyle, color: '#475569' }}>{contract.notes}</p></div>}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Payment History</p>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{payments.length} payment{payments.length !== 1 ? 's' : ''}</span>
        </div>
        {payments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '13px' }}>No payments recorded yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc' }}>
                {['Date', 'Amount', 'Method', 'Notes', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{formatDate(p.payment_date || p.created)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{formatKES(p.amount)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{p.method || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{p.notes || '-'}</td>
                  <td style={{ padding: '12px 16px' }}><PaymentBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}