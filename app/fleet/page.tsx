'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { formatKES } from '@/lib/utils'

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  'available':   { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', dot: '#22c55e' },
  'unavailable': { bg: 'rgba(239,68,68,0.15)', color: '#f87171', dot: '#ef4444' },
  'maintenance': { bg: 'rgba(249,115,22,0.15)', color: '#fb923c', dot: '#f97316' },
  'rented':      { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', dot: '#3b82f6' },
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    db.getVehicles()
      .then(data => { setVehicles(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = vehicles.filter(v => {
    const name = `${v.make} ${v.model} ${v.plate}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || v.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#0a0c10' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Loading fleet...</p>
    </div>
  )

  return (
    <div style={{ padding: '20px 24px', fontFamily: 'Inter, sans-serif', background: '#0a0c10', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Fleet</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{vehicles.length} vehicles</p>
        </div>
        <Link href='/fleet/new' style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '9px 18px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: '9px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer'
          }}>
            + Add Vehicle
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Vehicles', value: vehicles.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Available', value: vehicles.filter(v => v.status === 'available').length, color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Rented', value: vehicles.filter(v => v.status === 'rented').length, color: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
          { label: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '14px 16px', border: `1px solid ${s.color}33` }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' }}>
        <input
          placeholder="Search make, model, plate..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '9px', fontSize: '13px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#fff'
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '13px', background: '#1a1c24', color: '#fff', cursor: 'pointer' }}
        >
          <option value='All'>All Statuses</option>
          {['available', 'rented', 'maintenance', 'unavailable'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {(search || filterStatus !== 'All') && (
          <button
            onClick={() => { setSearch(''); setFilterStatus('All') }}
            style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No vehicles found</p>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {filtered.map(v => {
          const st = STATUS_STYLE[v.status] || STATUS_STYLE['available']
          return (
            <div key={v.id} style={{
              background: '#1a1c24', border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}>

              {/* Card top â€” color accent bar */}
              <div style={{ height: '4px', background: st.dot }} />

              {/* Card body */}
              <div style={{ padding: '16px' }}>

                {/* Top row â€” name + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {v.make} {v.model}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {v.plate}
                    </p>
                  </div>
                  <span style={{
                    background: st.bg, color: st.color,
                    border: `1px solid ${st.dot}44`,
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '10px', fontWeight: 700, textTransform: 'capitalize'
                  }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: st.dot, marginRight: '5px', verticalAlign: 'middle' }} />
                    {v.status || 'available'}
                  </span>
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[
                    { label: 'Year', value: v.year || '-' },
                    { label: 'Daily Rate', value: v.daily_rate ? formatKES(Number(v.daily_rate)) : '-' },
                    { label: 'Color', value: v.color || '-' },
                    { label: 'Seats', value: v.seats ? `${v.seats} seats` : '-' },
                  ].map(f => (
                    <div key={f.label}>
                      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{f.label}</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, margin: '2px 0 0' }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                {v.notes && (
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: '0 0 12px', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    {v.notes}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div style={{
                padding: '10px 16px', background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '8px'
              }}>
                <Link href={`/fleet/${v.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '7px', background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}>Edit</button>
                </Link>
                <Link href={`/fleet/${v.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '7px', background: '#2563eb',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}>View</button>
                </Link>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}

