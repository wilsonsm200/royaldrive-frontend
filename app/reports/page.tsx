'use client'
import { usePayments } from '@/hooks/usePayments'
import { useReservations } from '@/hooks/useReservations'
import { useVehicles } from '@/hooks/useVehicles'
import { useLeasingContracts } from '@/hooks/useLeasingContracts'
import { formatKES } from '@/lib/utils'
import { useEffect, useState } from 'react'

const isLeasingPayout = (p: any) =>
  p.category === 'Leasing Payout' || p.category === 'leasing_payout'

type Period = 'weekly' | 'monthly' | 'yearly'

function getDateRange(period: Period) {
  const now = new Date()
  const start = new Date()
  if (period === 'weekly') start.setDate(now.getDate() - 7)
  else if (period === 'monthly') start.setMonth(now.getMonth() - 1)
  else start.setFullYear(now.getFullYear() - 1)
  return { start, end: now }
}

function printReceipt(data: any, period: Period) {
  const win = window.open('', '_blank')
  if (!win) return
  const label = period.charAt(0).toUpperCase() + period.slice(1)
  const now = new Date().toLocaleDateString('en-KE', { dateStyle: 'full' })
  win.document.write(`<!DOCTYPE html><html><head><title>RoyalDrive ${label} Report</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#fff;color:#111;padding:40px;max-width:600px;margin:0 auto}.header{text-align:center;border-bottom:2px dashed #111;padding-bottom:20px;margin-bottom:20px}.logo{font-size:24px;font-weight:900;letter-spacing:4px}.sub{font-size:11px;color:#555;margin-top:4px;letter-spacing:2px}.title{font-size:13px;font-weight:700;margin-top:12px;text-transform:uppercase;letter-spacing:2px}.date{font-size:11px;color:#777;margin-top:4px}.section{margin:16px 0}.section-title{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:10px}.row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px}.row.total{font-weight:900;font-size:15px;border-top:2px dashed #111;padding-top:10px;margin-top:10px}.row.payout{color:#c00}.footer{text-align:center;margin-top:24px;border-top:2px dashed #111;padding-top:16px;font-size:10px;color:#999;letter-spacing:1px}</style>
  </head><body>
  <div class="header"><div class="logo">ROYALDRIVE</div><div class="sub">MOBILITY MANAGEMENT</div><div class="title">${label} Revenue Report</div><div class="date">Generated: ${now}</div></div>
  <div class="section"><div class="section-title">Revenue Summary</div>
  <div class="row"><span>Total Revenue</span><span>${formatKES(data.totalRevenue)}</span></div>
  <div class="row"><span>Paid Payments</span><span>${data.totalPaid}</span></div>
  <div class="row"><span>Pending Payments</span><span>${data.totalPending}</span></div>
  <div class="row"><span>Overdue Payments</span><span>${data.totalOverdue}</span></div>
  <div class="row payout"><span>Leasing Payouts (expense)</span><span>-${formatKES(data.totalPayouts)}</span></div>
  <div class="row total"><span>Net Revenue</span><span>${formatKES(data.totalRevenue - data.totalPayouts)}</span></div></div>
  <div class="section"><div class="section-title">Operations</div>
  <div class="row"><span>Total Reservations</span><span>${data.totalReservations}</span></div>
  <div class="row"><span>Total Vehicles</span><span>${data.totalVehicles}</span></div>
  <div class="row"><span>Active Vehicles</span><span>${data.activeVehicles}</span></div>
  <div class="row"><span>Fleet Utilization</span><span>${data.fleetUtilization}%</span></div></div>
  ${data.revenueByService.length > 0 ? `<div class="section"><div class="section-title">Revenue by Service</div>${data.revenueByService.map((s: any) => `<div class="row"><span>${s.service}</span><span>${formatKES(s.amount)}</span></div>`).join('')}</div>` : ''}
  <div class="footer"><div>Thank you for using RoyalDrive</div><div style="margin-top:6px">This is a system-generated report</div></div>
  </body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}

export default function ReportsPage() {
  const { payments, loading: paymentsLoading } = usePayments()
  const { reservations, loading: reservationsLoading } = useReservations()
  const { vehicles, loading: vehiclesLoading } = useVehicles()
  const { contracts, loading: contractsLoading } = useLeasingContracts()
  const [period, setPeriod] = useState<Period>('monthly')

  const [stats, setStats] = useState({
    totalRevenue: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0,
    totalReservations: 0, totalVehicles: 0, activeVehicles: 0, totalPayouts: 0,
    revenueByMonth: [] as { label: string; amount: number }[],
    revenueByService: [] as { service: string; amount: number }[],
    fleetUtilization: 0,
  })

  useEffect(() => {
    if (paymentsLoading || reservationsLoading || vehiclesLoading || contractsLoading) return
    const { start, end } = getDateRange(period)
    const inRange = (d: string) => { const dt = new Date(d); return dt >= start && dt <= end }

    const paidPayments = payments.filter(p => p.status.toLowerCase() === 'paid' && !isLeasingPayout(p))
    const leasingPayouts = payments.filter(p => p.status.toLowerCase() === 'paid' && isLeasingPayout(p))
    const filteredReservations = reservations.filter(r => inRange(r.pickup_date || r.created))

    const totalRevenue = paidPayments.reduce((s, p) => s + (p.amount || 0), 0)
    const totalPayouts = leasingPayouts.reduce((s, p) => s + (p.amount || 0), 0)
    const activeVehicles = vehicles.filter(v => ['available','on_trip','active'].includes(v.status?.toLowerCase())).length

    const buckets = new Map<string, number>()
    if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); buckets.set(d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' }), 0) }
      paidPayments.forEach(p => { const k = new Date(p.payment_date || p.created).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' }); if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + (p.amount || 0)) })
    } else {
      const count = period === 'yearly' ? 12 : 6
      for (let i = count - 1; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); buckets.set(d.toLocaleString('default', { month: 'short' }), 0) }
      paidPayments.forEach(p => { const k = new Date(p.payment_date || p.created).toLocaleString('default', { month: 'short' }); if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + (p.amount || 0)) })
    }

    const serviceMap = new Map<string, number>()
    filteredReservations.forEach(r => { const s = r.service_type || 'Other'; serviceMap.set(s, (serviceMap.get(s) || 0) + (r.amount || 0)) })

    setStats({
      totalRevenue, totalPayouts,
      totalPaid: paidPayments.length,
      totalPending: payments.filter(p => p.status.toLowerCase() === 'pending').length,
      totalOverdue: payments.filter(p => p.status.toLowerCase() === 'overdue').length,
      totalReservations: filteredReservations.length,
      totalVehicles: vehicles.length, activeVehicles,
      fleetUtilization: vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0,
      revenueByMonth: Array.from(buckets.entries()).map(([label, amount]) => ({ label, amount })),
      revenueByService: Array.from(serviceMap.entries()).map(([service, amount]) => ({ service, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5),
    })
  }, [payments, reservations, vehicles, contracts, paymentsLoading, reservationsLoading, vehiclesLoading, contractsLoading, period])

  const isLoading = paymentsLoading || reservationsLoading || vehiclesLoading || contractsLoading
  if (isLoading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0c10' }}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Loading reports…</p></div>

  const maxBar = Math.max(...stats.revenueByMonth.map(m => m.amount), 1)
  const netRevenue = stats.totalRevenue - stats.totalPayouts
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1)

  const card = (accent: string): React.CSSProperties => ({
    background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
    padding: '10px 14px', borderTop: `3px solid ${accent}`,
    display: 'flex', flexDirection: 'column', gap: '4px',
  })

  const sectionLabel: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
  }

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100vh', boxSizing: 'border-box', background: '#0a0c10', overflowX: 'hidden' }}>
      <style>{`
        .reports-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }
        .reports-main-grid {
          display: grid;
          grid-template-columns: 1fr 1.8fr 1fr;
          gap: 8px;
        }
        @media (max-width: 900px) {
          .reports-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .reports-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>Reports</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
            {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: period === p ? '#1a1c24' : 'transparent', color: period === p ? '#fff' : 'rgba(255,255,255,0.5)', boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.2)' : 'none' }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => printReceipt(stats, period)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            Generate {periodLabel} Receipt
          </button>
        </div>
      </div>

      {/* Revenue Overview — 6 cards */}
      <div>
        <p style={sectionLabel}>Revenue Overview — {periodLabel}</p>
        <div className="reports-stats-grid">
          {[
            { label: 'Total Revenue', value: formatKES(stats.totalRevenue), accent: '#16a34a' },
            { label: 'Net Revenue', value: formatKES(netRevenue), accent: '#60a5fa', sub: 'after payouts' },
            { label: 'Paid', value: stats.totalPaid, accent: '#60a5fa' },
            { label: 'Pending', value: stats.totalPending, accent: '#fb923c' },
            { label: 'Overdue', value: stats.totalOverdue, accent: '#f87171' },
            { label: 'Leasing Payouts', value: formatKES(stats.totalPayouts), accent: '#f87171' },
          ].map(s => (
            <div key={s.label} style={card(s.accent)}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{s.label}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{s.value}</span>
              {s.sub && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{s.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Operations + Chart + Service side by side (stacks on mobile) */}
      <div className="reports-main-grid">

        {/* Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={sectionLabel}>Operations</p>
          {[
            { label: 'Reservations', value: stats.totalReservations, accent: '#60a5fa' },
            { label: 'Total Vehicles', value: stats.totalVehicles, accent: '#60a5fa' },
            { label: 'Active Vehicles', value: `${stats.activeVehicles} (${stats.fleetUtilization}%)`, accent: '#4ade80' },
          ].map(s => (
            <div key={s.label} style={card(s.accent)}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{s.label}</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <p style={sectionLabel}>Revenue by {period === 'weekly' ? 'Day' : period === 'yearly' ? 'Month (12mo)' : 'Month (6mo)'}</p>
          <div style={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
            {stats.revenueByMonth.every(m => m.amount === 0)
              ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 'auto' }}>No data for this period</p>
              : <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', flex: 1, minHeight: 0 }}>
                    {stats.revenueByMonth.map((item, idx) => (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                        <div title={formatKES(item.amount)} style={{ width: '100%', background: item.amount > 0 ? '#60a5fa' : 'rgba(255,255,255,0.08)', borderRadius: '4px 4px 0 0', height: `${Math.max(3, (item.amount / maxBar) * 80)}px`, transition: 'height 0.4s ease' }} />
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '4px' }}>
                    {stats.revenueByMonth.map((item, idx) => (
                      <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: item.amount > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>{item.amount > 0 ? formatKES(item.amount) : '—'}</span>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        </div>

        {/* Revenue by Service */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <p style={sectionLabel}>By Service Type</p>
          <div style={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', flex: 1, minHeight: '160px', overflowY: 'auto' }}>
            {stats.revenueByService.length === 0
              ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 'auto' }}>No data</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.revenueByService.map((item, idx) => {
                    const colors = ['#60a5fa', '#4ade80', '#fb923c', '#f87171', '#c4b5fd']
                    const pct = (item.amount / (stats.revenueByService[0]?.amount || 1)) * 100
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{item.service}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{formatKES(item.amount)}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: colors[idx % colors.length], height: '100%', borderRadius: '99px' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </div>
        </div>

      </div>
    </div>
  )
}