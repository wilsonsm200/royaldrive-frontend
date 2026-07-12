'use client'
import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/lib/constants'

const REVENUE_CATEGORIES = ['Car Hire', 'Self Drive', 'Chauffeur', 'Airport Transfer', 'Wedding', 'Long Distance', 'Car Sale']
const EXPENSE_CATEGORIES = ['Leasing Payout', 'Office Rent', 'Car Wash', 'Fuel', 'Driver Salary', 'Insurance', 'Repairs & Maintenance', 'Maintenance', 'Driver Payment', 'Other']

type Payment = {
  id: string
  category: string
  reference_id?: string
  amount: number
  method: string
  status: string
  payment_date?: string
  notes?: string
  created: string
  updated: string
}

function isExpenseCategory(category: string) {
  return EXPENSE_CATEGORIES.includes(category)
}

function generateReceipt(p: Payment) {
  const date = formatDate(p.payment_date || p.created)
  const now = new Date().toLocaleString('en-KE')
  const receiptNo = `BRM-${p.id.slice(0, 8).toUpperCase()}`
  const isExpense = isExpenseCategory(p.category)

  const barWidths = [3,1,2,1,4,1,2,1,3,1,1,1,4,1,2,1,3,1,2,1,1,1,3,1,4,1,2,1,3,1,1,1,2,1,4,1,3,1,2,1,1,1,3,1,2,1,4,1,3,1,2,1]
  const barcodeHTML = barWidths.map((w, i) =>
    `<div style="display:inline-block;width:${w * 2}px;height:45px;background:${i % 2 === 0 ? '#222' : '#fff'};vertical-align:top;"></div>`
  ).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt ${receiptNo}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #888;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 30px 10px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
    }
    .receipt { background: #f0f0f0; width: 280px; padding: 0; position: relative; filter: drop-shadow(0 4px 16px rgba(0,0,0,0.35)); }
    .torn-top { width: 100%; height: 18px; background: #888; -webkit-mask: radial-gradient(circle at 6px -2px, #888 8px, transparent 9px) repeat-x; mask: radial-gradient(circle at 6px -2px, #888 8px, transparent 9px) repeat-x; mask-size: 12px 18px; -webkit-mask-size: 12px 18px; }
    .torn-bottom { width: 100%; height: 18px; background: #888; -webkit-mask: radial-gradient(circle at 6px 20px, #888 8px, transparent 9px) repeat-x; mask: radial-gradient(circle at 6px 20px, #888 8px, transparent 9px) repeat-x; mask-size: 12px 18px; -webkit-mask-size: 12px 18px; }
    .inner { background: #f8f8f8; padding: 16px 18px; }
    .title { font-size: 16px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; color: #1a1a1a; text-align: center; margin-bottom: 6px; }
    .address { font-size: 10px; color: #555; text-align: center; line-height: 1.7; margin-bottom: 4px; }
    .dashed { border: none; border-top: 1px dashed #aaa; margin: 10px 0; }
    .solid { border: none; border-top: 2px solid #333; margin: 10px 0; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 7px; font-size: 12px; }
    .row .lbl { color: #444; flex: 1; }
    .row .val { color: #1a1a1a; font-weight: 700; text-align: right; max-width: 55%; word-break: break-word; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin: 4px 0; }
    .total-lbl { font-size: 15px; font-weight: 900; color: #1a1a1a; letter-spacing: 1px; }
    .total-val { font-size: 18px; font-weight: 900; color: ${isExpense ? '#cc0000' : '#1a1a1a'}; }
    .status-pill { display: inline-block; padding: 3px 12px; border-radius: 3px; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; background: ${p.status === 'paid' ? '#d4edda' : '#fff3cd'}; color: ${p.status === 'paid' ? '#155724' : '#856404'}; border: 1px solid ${p.status === 'paid' ? '#c3e6cb' : '#ffeeba'}; }
    .barcode-wrap { text-align: center; margin: 14px 0 6px; }
    .receipt-no { text-align: center; font-size: 10px; color: #888; letter-spacing: 3px; margin-top: 4px; }
    .thank { font-size: 16px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; text-align: center; color: #1a1a1a; margin: 10px 0 4px; }
    .note { font-size: 9px; color: #999; text-align: center; line-height: 1.7; margin-top: 4px; }
    .print-btn { text-align: center; margin-top: 16px; padding-bottom: 8px; background: #f8f8f8; }
    @media print {
      @page { size: 80mm auto; margin: 0; }
      body { background: #fff; padding: 0; margin: 0; display: block; }
      .receipt { width: 100% !important; filter: none; }
      .torn-top, .torn-bottom { display: none; }
      .inner { padding: 10px 14px; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="torn-top"></div>
    <div class="inner">
      <div class="title">Payment Receipt</div>
      <div class="address">
        Blessed RoyalDrive Mobility<br/>
        Murang'a, Kenya<br/>
        Tel: 0716233680 &bull; +254 750 200 323<br/>
        blessedroyaldrivemobility.co.ke
      </div>
      <div class="dashed"></div>
      <div class="row"><span class="lbl">Date:</span><span class="val">${date}</span></div>
      <div class="row"><span class="lbl">Time:</span><span class="val">${now.split(',')[1]?.trim() || now}</span></div>
      <div class="dashed"></div>
      <div class="row"><span class="lbl">Receipt No.</span><span class="val">${receiptNo}</span></div>
      <div class="row"><span class="lbl">Category</span><span class="val">${p.category}</span></div>
      <div class="row"><span class="lbl">Method</span><span class="val">${p.method}</span></div>
      ${p.reference_id ? `<div class="row"><span class="lbl">Reference</span><span class="val">${p.reference_id}</span></div>` : ''}
      ${p.notes ? `<div class="row"><span class="lbl">Description</span><span class="val">${p.notes}</span></div>` : ''}
      <div class="row"><span class="lbl">Status</span><span class="val"><span class="status-pill">${p.status.toUpperCase()}</span></span></div>
      <div class="solid"></div>
      <div class="total-row">
        <span class="total-lbl">TOTAL</span>
        <span class="total-val">${formatKES(p.amount)}</span>
      </div>
      <div class="solid"></div>
      <div class="thank">Thank You</div>
      <div class="address" style="margin-top:4px;">
        <em>Every Journey, Elevated.</em><br/>
        wilsonmagak@gmail.com
      </div>
      <div class="barcode-wrap">${barcodeHTML}</div>
      <div class="receipt-no">${receiptNo}</div>
      <div class="note">
        System-generated receipt. Please keep for your records.<br/>
        Served by: Blessed RoyalDrive Mobility System
      </div>
    </div>
    <div class="torn-bottom"></div>
    <div class="print-btn">
      <button onclick="window.print()" style="padding:8px 24px;background:#1a1a1a;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:2px;font-family:Courier New,monospace;margin-top:8px;">
        PRINT / SAVE PDF
      </button>
    </div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=360,height=800')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#2a2d38',
  color: '#fff',
  cursor: 'pointer',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 500 as const,
  color: 'rgba(255,255,255,0.65)',
  marginBottom: '6px',
}

const defaultForm = {
  category: 'Self Drive',
  reference_id: '',
  amount: '',
  method: 'Mpesa',
  status: 'paid',
  payment_date: '',
  notes: '',
}

function sortByDate(list: Payment[]) {
  return [...list].sort((a, b) => {
    const dateA = new Date(a.payment_date || a.created).getTime()
    const dateB = new Date(b.payment_date || b.created).getTime()
    return dateB - dateA
  })
}

export default function PaymentsPage() {
  const { payments, loading, createPayment, updatePayment, deletePayment } = usePayments()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [form, setForm] = useState(defaultForm)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function openNew() {
    setEditingId(null)
    setForm(defaultForm)
    setShowForm(true)
  }

  function openEdit(p: any) {
    setEditingId(p.id)
    setForm({
      category: p.category || 'Self Drive',
      reference_id: p.reference_id || '',
      amount: String(p.amount || ''),
      method: p.method || 'Mpesa',
      status: p.status || 'paid',
      payment_date: p.payment_date ? p.payment_date.split(' ')[0] : '',
      notes: p.notes || '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        category: form.category as any,
        reference_id: form.reference_id || undefined,
        amount: Number(form.amount),
        method: form.method as any,
        status: form.status as any,
        payment_date: form.payment_date || undefined,
        notes: form.notes || undefined,
      }
      if (editingId) {
        await updatePayment(editingId, data)
      } else {
        const record = await createPayment(data)
        generateReceipt(record as unknown as Payment)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(defaultForm)
    } catch {
      alert('Failed to save payment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    try {
      await deletePayment(deletingId)
      setDeletingId(null)
    } catch {
      alert('Failed to delete payment.')
    } finally {
      setDeleting(false)
    }
  }

  // Summary calculations
  const paidPayments = payments.filter(p => p.status === 'paid')
  const totalRevenue = paidPayments.filter(p => REVENUE_CATEGORIES.includes(p.category)).reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const totalLeasingPayouts = paidPayments.filter(p => p.category === 'Leasing Payout').reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const totalOtherExpenses = paidPayments.filter(p => EXPENSE_CATEGORIES.includes(p.category) && p.category !== 'Leasing Payout').reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const netProfit = totalRevenue - totalLeasingPayouts - totalOtherExpenses

  const filtered = sortByDate(
    payments.filter(p => {
      const matchSearch = !search || (p.notes || p.reference_id || p.category || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === 'All' || p.category === filterCategory
      return matchSearch && matchCat
    })
  )

  if (loading && payments.length === 0) return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading payments...</p>
    </div>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '16px',
      fontFamily: 'Inter, sans-serif', height: '100%', overflow: 'hidden',
      padding: '0', background: '#0a0c10', color: '#fff'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Payments</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{payments.length} total records</p>
        </div>
        <button onClick={openNew} style={{
          padding: '9px 18px', background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
        }}>
          + Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', flexShrink: 0 }}>
        {[
          { label: 'Total Revenue', value: formatKES(totalRevenue), color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
          { label: 'Leasing Payouts', value: formatKES(totalLeasingPayouts), color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
          { label: 'Other Expenses', value: formatKES(totalOtherExpenses), color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' },
          { label: 'Net Profit', value: formatKES(netProfit), color: netProfit >= 0 ? '#6366f1' : '#ef4444', bg: netProfit >= 0 ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)', border: netProfit >= 0 ? 'rgba(99,102,241,0.3)' : 'rgba(239,68,68,0.3)' },
          { label: 'Total Records', value: String(payments.length), color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '14px 16px', border: `1px solid ${s.border}` }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: '17px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1a1c24', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px',
            padding: '32px', width: '400px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '20px', color: '#ef4444', fontWeight: 900 }}>!</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Delete Payment</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.6 }}>
              This action cannot be undone. The payment record will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 28px', background: '#ef4444', color: '#fff',
                  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeletingId(null)}
                style={{
                  padding: '10px 28px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form onSubmit={handleSubmit} style={{
            background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
            padding: '28px', width: '560px', display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                {editingId ? 'Edit Payment' : 'Record Payment'}
              </h2>
              <button type='button' onClick={() => { setShowForm(false); setEditingId(null) }}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>x</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select name='category' value={form.category} onChange={handleChange} required style={selectStyle}>
                  <optgroup label="-- Revenue --" style={{ color: '#10b981', background: '#2a2d38' }}>
                    {REVENUE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#2a2d38', color: '#fff' }}>{c}</option>)}
                  </optgroup>
                  <optgroup label="-- Expenses --" style={{ color: '#f87171', background: '#2a2d38' }}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#2a2d38', color: '#fff' }}>{c}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount (KES) *</label>
                <input type='number' name='amount' value={form.amount} onChange={handleChange} required placeholder='e.g 5000' style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Method *</label>
                <select name='method' value={form.method} onChange={handleChange} required style={selectStyle}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m} style={{ background: '#2a2d38', color: '#fff' }}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status *</label>
                <select name='status' value={form.status} onChange={handleChange} required style={selectStyle}>
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s.toLowerCase()} style={{ background: '#2a2d38', color: '#fff' }}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Payment Date</label>
                <input type='date' name='payment_date' value={form.payment_date} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Reference</label>
                <input type='text' name='reference_id' value={form.reference_id} onChange={handleChange} placeholder='e.g reservation ID' style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea name='notes' value={form.notes} onChange={handleChange} rows={2}
                placeholder='e.g paid for voxy KCV 678V'
                style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <div style={{
              background: isExpenseCategory(form.category) ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${isExpenseCategory(form.category) ? 'rgba(248,113,113,0.3)' : 'rgba(16,185,129,0.3)'}`,
              borderRadius: '8px', padding: '10px 14px'
            }}>
              <p style={{ fontSize: '12px', color: isExpenseCategory(form.category) ? '#f87171' : '#10b981', margin: 0, fontWeight: 500 }}>
                {isExpenseCategory(form.category)
                  ? 'Expense — this will be counted as money going OUT and reduce your net profit'
                  : 'Revenue — this will be counted as money coming IN'}
                {!editingId && ' — A receipt will be generated after saving'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type='submit' disabled={saving} style={{
                flex: 1, padding: '11px 24px', background: '#6366f1', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
              }}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save & Generate Receipt'}
              </button>
              <button type='button' onClick={() => { setShowForm(false); setEditingId(null) }} style={{
                padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        <input
          placeholder="Search notes, reference, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', background: '#1a1c24', color: '#fff', cursor: 'pointer' }}>
          <option value='All' style={{ background: '#1a1c24' }}>All Categories</option>
          <optgroup label="-- Revenue --" style={{ background: '#1a1c24', color: '#10b981' }}>
            {REVENUE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a1c24', color: '#fff' }}>{c}</option>)}
          </optgroup>
          <optgroup label="-- Expenses --" style={{ background: '#1a1c24', color: '#f87171' }}>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a1c24', color: '#fff' }}>{c}</option>)}
          </optgroup>
        </select>
        {(search || filterCategory !== 'All') && (
          <button onClick={() => { setSearch(''); setFilterCategory('All') }}
            style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            Clear
          </button>
        )}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      <div style={{
        background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
        overflow: 'auto', flex: 1, minHeight: 0
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0f1117' }}>
              {['Type', 'Category', 'For / Notes', 'Amount', 'Method', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px', fontSize: '13px' }}>No payments found</td>
              </tr>
            )}
            {filtered.map(p => {
              const isExpense = isExpenseCategory(p.category)
              return (
                <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: isExpense ? 'rgba(248,113,113,0.15)' : 'rgba(16,185,129,0.15)',
                      color: isExpense ? '#f87171' : '#10b981',
                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                      whiteSpace: 'nowrap', letterSpacing: '0.05em'
                    }}>
                      {isExpense ? 'OUT' : 'IN'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.notes || p.reference_id || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: isExpense ? '#f87171' : '#34d399', whiteSpace: 'nowrap' }}>
                    {isExpense ? '- ' : '+ '}{formatKES(p.amount)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{p.method}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{formatDate(p.payment_date || p.created)}</td>
                  <td style={{ padding: '12px 16px' }}><PaymentBadge status={p.status} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          padding: '5px 11px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.3)', borderRadius: '7px', fontSize: '12px',
                          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => generateReceipt(p as unknown as Payment)}
                        style={{
                          padding: '5px 11px', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd',
                          border: '1px solid rgba(139,92,246,0.3)', borderRadius: '7px', fontSize: '12px',
                          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        Receipt
                      </button>
                      <button
                        onClick={() => setDeletingId(p.id)}
                        style={{
                          padding: '5px 11px', background: 'rgba(239,68,68,0.1)', color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.25)', borderRadius: '7px', fontSize: '12px',
                          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}