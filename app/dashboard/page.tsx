'use client'
import { useEffect, useState } from 'react'
import { useReservations } from '@/hooks/useReservations'
import { useVehicles } from '@/hooks/useVehicles'
import { usePayments } from '@/hooks/usePayments'
import { useDrivers } from '@/hooks/useDrivers'
import { useLeasingContracts } from '@/hooks/useLeasingContracts'
import PaymentBadge from '@/components/PaymentBadge'
import { formatKES, formatDate } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'

const REVENUE_CATEGORIES = ['Car Hire', 'Self Drive', 'Chauffeur', 'Airport Transfer', 'Wedding', 'Long Distance', 'Car Sale']
const EXPENSE_CATEGORIES = ['Leasing Payout', 'Office Rent', 'Car Wash', 'Fuel', 'Driver Salary', 'Insurance', 'Repairs & Maintenance', 'Maintenance', 'Driver Payment', 'Other']

const CATEGORY_COLORS: Record<string, string> = {
  'Car Hire': '#6366f1',
  'Self Drive': '#f59e0b',
  'Chauffeur': '#a855f7',
  'Airport Transfer': '#10b981',
  'Wedding': '#ec4899',
  'Long Distance': '#3b82f6',
  'Car Sale': '#14b8a6',
  'Other': '#64748b',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const isRevenue = (p: any) => REVENUE_CATEGORIES.includes(p.category)
const isLeasingPayout = (p: any) => p.category === 'Leasing Payout' || p.category === 'leasing_payout'
const isOtherExpense = (p: any) => EXPENSE_CATEGORIES.includes(p.category) && !isLeasingPayout(p)

function calcExpected(startDate: string, amount: number, frequency: string): number {
  const start = new Date(startDate)
  const now = new Date()
  if (start > now) return 0
  let periods = 0
  if (frequency === 'monthly') {
    periods = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (now.getDate() > start.getDate()) periods += 1
  } else if (frequency === 'weekly') {
    periods = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  } else {
    periods = 1
  }
  return periods * amount
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const w = 64, h = 28
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.15" />
    </svg>
  )
}

function DonutChart({ slices, size = 80 }: { slices: { value: number; color: string; label: string }[]; size?: number }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1
  const r = size / 2 - 7, cx = size / 2, cy = size / 2, stroke = 9
  const circ = 2 * Math.PI * r
  let cum = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {slices.map((s, i) => {
        const pct = s.value / total
        const dash = pct * circ
        const offset = -(cum * circ) + circ / 4
        cum += pct
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

function LineChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const min = Math.min(...data.map(d => d.value))
  const w = 100, h = 60, pad = 4
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (d.value - min) / (max - min || 1)) * (h - pad * 2)
    return { x, y, d }
  })
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`
  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '60px', overflow: 'visible' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i}
            x1={pad} y1={pad + (1 - t) * (h - pad * 2)}
            x2={w - pad} y2={pad + (1 - t) * (h - pad * 2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
          />
        ))}
        <path d={areaPath} fill="url(#lineGrad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} stroke="#1a1f35" strokeWidth="1.5" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', flex: 1, textAlign: 'center' }}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

function StatCard({
  label, value, sub, gradient, sparkData, pct = false, isKES = false, delay = 0
}: {
  label: string; value: number; sub: string; gradient: string;
  sparkData: number[]; pct?: boolean; isKES?: boolean; delay?: number
}) {
  const counted = useCountUp(value, 1400)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  const display = isKES
    ? `KES ${counted.toLocaleString()}`
    : pct
    ? `${counted}%`
    : counted.toLocaleString()

  return (
    <div style={{
      background: gradient,
      borderRadius: '16px',
      padding: '16px 18px',
      position: 'relative',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-16px', left: '-16px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: '21px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{display}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>{sub}</p>
        <Sparkline data={sparkData} color="rgba(255,255,255,0.9)" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { reservations, customerMap, loading: rL } = useReservations()
  const { vehicles, loading: vL } = useVehicles()
  const { payments, loading: pL } = usePayments()
  const { drivers, loading: dL } = useDrivers()
  const { contracts, loading: cL } = useLeasingContracts()

  const [ready, setReady] = useState(false)
  const [stats, setStats] = useState({
    totalCollection: 0, netProfit: 0, collectionRate: 0,
    totalRes: 0, todayRes: 0, overPay: 0, pendPay: 0,
    onTripVeh: 0, availableVeh: 0, totalVeh: 0,
    totalPayouts: 0, totalOtherExpenses: 0, monthRev: 0,
  })
  const [recentRes, setRecentRes] = useState<any[]>([])
  const [recentPay, setRecentPay] = useState<any[]>([])
  const [serviceBreakdown, setServiceBreakdown] = useState<{ label: string; value: number; color: string }[]>([])
  const [monthlyRev, setMonthlyRev] = useState<{ label: string; value: number }[]>([])
  const [leasingBalance, setLeasingBalance] = useState(0)
  const { settings: appSettings } = useSettings()
  const monthlyTarget = parseInt(appSettings['monthly_target'] || '500000', 10)

  const isLoading = rL || vL || pL || dL || cL

  useEffect(() => {
    if (isLoading) return
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const paidPayments = payments.filter(p => ['paid', 'Paid'].includes(p.status))

    // FIX 1: Revenue = only REVENUE_CATEGORIES
    const revenuePayments = paidPayments.filter(p => isRevenue(p))

    // FIX 2: Separate leasing payouts and other expenses
    const leasingPayouts = paidPayments.filter(p => isLeasingPayout(p))
    const otherExpenses = paidPayments.filter(p => isOtherExpense(p))

    const totalCollection = revenuePayments.reduce((s, p) => s + (p.amount || 0), 0)
    const totalPayoutsAmt = leasingPayouts.reduce((s, p) => s + (p.amount || 0), 0)
    const totalOtherExpensesAmt = otherExpenses.reduce((s, p) => s + (p.amount || 0), 0)

    // FIX 3: Net profit = revenue - leasing payouts - other expenses
    const netProfit = totalCollection - totalPayoutsAmt - totalOtherExpensesAmt

    const totalInvoiced = reservations.reduce((s, r) => s + (r.amount || 0), 0)
    const collectionRate = totalInvoiced > 0 ? Math.min(100, Math.round((totalCollection / totalInvoiced) * 100)) : 0

    // FIX 4: Monthly revenue from payment_date not created, revenue only
    const monthRevIncome = revenuePayments.filter(p => {
      const d = new Date(p.payment_date || p.created)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).reduce((s, p) => s + (p.amount || 0), 0)

    const monthRevPayouts = leasingPayouts.filter(p => {
      const d = new Date(p.payment_date || p.created)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).reduce((s, p) => s + (p.amount || 0), 0)

    const monthRevOtherExp = otherExpenses.filter(p => {
      const d = new Date(p.payment_date || p.created)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).reduce((s, p) => s + (p.amount || 0), 0)

    const monthRev = Math.max(0, monthRevIncome - monthRevPayouts - monthRevOtherExp)

    // Monthly chart — 6 months of net (revenue - payouts - expenses)
    const mMap: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1)
      mMap[`${d.getFullYear()}-${d.getMonth()}`] = 0
    }
    revenuePayments.forEach(p => {
      const d = new Date(p.payment_date || p.created)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (k in mMap) mMap[k] += p.amount || 0
    })
    leasingPayouts.forEach(p => {
      const d = new Date(p.payment_date || p.created)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (k in mMap) mMap[k] -= p.amount || 0
    })
    otherExpenses.forEach(p => {
      const d = new Date(p.payment_date || p.created)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (k in mMap) mMap[k] -= p.amount || 0
    })
    const mRevArr = Object.entries(mMap).map(([k, v]) => ({
      label: MONTHS[parseInt(k.split('-')[1])],
      value: Math.max(0, v as number)
    }))
    setMonthlyRev(mRevArr)

    // FIX 5: Revenue by service from actual payment categories (revenue only)
    const sMap: Record<string, number> = {}
    revenuePayments.forEach(p => {
      const cat = p.category || 'Other'
      sMap[cat] = (sMap[cat] || 0) + (p.amount || 0)
    })
    setServiceBreakdown(
      Object.entries(sMap)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({
          label,
          value: value as number,
          color: CATEGORY_COLORS[label] || '#64748b'
        }))
    )

    // Leasing balance
    let totalExpectedAmount = 0
    contracts.forEach(c => { totalExpectedAmount += calcExpected(c.start_date, c.payout_amount, c.payout_frequency) })
    const totalLeasingPaid = leasingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0)
    const balance = totalExpectedAmount - totalLeasingPaid
    setLeasingBalance(balance > 0 ? balance : 0)

    setStats({
      totalCollection,
      netProfit,
      collectionRate,
      totalRes: reservations.length,
      todayRes: reservations.filter(r => r.created?.startsWith(todayStr)).length,
      overPay: payments.filter(p => ['overdue', 'Overdue'].includes(p.status)).length,
      pendPay: payments.filter(p => ['pending', 'Pending'].includes(p.status)).length,
      onTripVeh: vehicles.filter(v => v.status === 'On Trip').length,
      availableVeh: vehicles.filter(v => ['Available', 'available'].includes(v.status)).length,
      totalVeh: vehicles.length,
      totalPayouts: totalPayoutsAmt,
      totalOtherExpenses: totalOtherExpensesAmt,
      monthRev,
    })

    setRecentRes([...reservations].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 5))
    // FIX 6: Recent payments shows ALL payments (in & out), sorted by payment_date
    setRecentPay(
      [...payments]
        .sort((a, b) => new Date(b.payment_date || b.created).getTime() - new Date(a.payment_date || a.created).getTime())
        .slice(0, 6)
    )
    setReady(true)
  }, [reservations, vehicles, payments, drivers, contracts, isLoading])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const targetPct = Math.min(100, Math.round((stats.monthRev / monthlyTarget) * 100))
  const sparkBase = monthlyRev.map(m => m.value)

  const BG = '#0d1117'
  const SURFACE = '#161b27'
  const SURFACE2 = '#1e2538'
  const BORDER = 'rgba(255,255,255,0.07)'
  const TEXT = '#e8eaf0'
  const MUTED = 'rgba(255,255,255,0.35)'

  if (!ready) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const card: React.CSSProperties = {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '14px 16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  }

  const lbl: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: MUTED,
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px',
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '0 6px 8px', fontSize: '9px', fontWeight: 700,
    color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em',
    borderBottom: `1px solid ${BORDER}`,
  }

  const tdStyle: React.CSSProperties = {
    padding: '8px 6px', borderBottom: `1px solid rgba(255,255,255,0.03)`, fontSize: '11px',
  }

  return (
    <div style={{
      background: BG, height: '100%', overflow: 'hidden',
      padding: '16px 20px', fontFamily: 'system-ui, -apple-system, sans-serif',
      color: TEXT, display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        tr:hover td { background: rgba(255,255,255,0.03) !important; transition: background 0.15s; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, animation: 'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
            {greeting}
          </h1>
          <p style={{ fontSize: '11px', color: MUTED, margin: '2px 0 0' }}>
            {now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          {[
            { label: '+ New Reservation', href: '/reservations/new', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', shadow: '0 4px 16px rgba(99,102,241,0.4)' },
            { label: '+ Record Payment', href: '/payments', bg: SURFACE2, color: 'rgba(255,255,255,0.7)', border: `1px solid ${BORDER}`, shadow: 'none' },
            { label: '+ Add Vehicle', href: '/fleet/new', bg: SURFACE2, color: 'rgba(255,255,255,0.7)', border: `1px solid ${BORDER}`, shadow: 'none' },
          ].map(b => (
            <a key={b.label} href={b.href} style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '7px 13px', background: b.bg, color: b.color,
                border: b.border as string, borderRadius: '10px', fontSize: '11px',
                fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em', boxShadow: b.shadow,
              }}>{b.label}</button>
            </a>
          ))}
        </div>
      </div>

      {/* ROW 1: STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', flexShrink: 0 }}>
        <StatCard label="Total Revenue" value={stats.totalCollection} sub="Paid revenue only"
          gradient="linear-gradient(135deg,#1a1f6e 0%,#2d35b5 50%,#5b5fcf 100%)"
          sparkData={sparkBase} isKES delay={0} />
        <StatCard label="Net Profit" value={stats.netProfit} sub="Revenue minus all expenses"
          gradient={stats.netProfit >= 0
            ? "linear-gradient(135deg,#0a4f3c 0%,#0d7a5a 50%,#10b981 100%)"
            : "linear-gradient(135deg,#5c1a1a 0%,#991b1b 50%,#ef4444 100%)"}
          sparkData={sparkBase} isKES delay={80} />
        <StatCard label="Collection Rate" value={stats.collectionRate} sub="Invoiced vs collected"
          gradient="linear-gradient(135deg,#5c3a00 0%,#92580a 50%,#f59e0b 100%)"
          sparkData={[stats.collectionRate, 100 - stats.collectionRate]} pct delay={160} />
        <StatCard label="Reservations" value={stats.totalRes} sub={`${stats.todayRes} today`}
          gradient="linear-gradient(135deg,#3b0764 0%,#6b21a8 50%,#a855f7 100%)"
          sparkData={sparkBase} delay={240} />
        <StatCard label="Leasing Balance" value={leasingBalance} sub="Due this month"
          gradient={leasingBalance > 0
            ? "linear-gradient(135deg,#500724 0%,#9f1239 50%,#f43f5e 100%)"
            : "linear-gradient(135deg,#0a4f3c 0%,#0d7a5a 50%,#10b981 100%)"}
          sparkData={[leasingBalance]} isKES delay={320} />
      </div>

      {/* ROW 2: CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: '10px', flexShrink: 0 }}>

        {/* Monthly Revenue */}
        <div style={{ ...card, animation: 'fadeUp 0.5s 0.2s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={lbl}>Monthly Net Revenue</p>
            <p style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#4ade80' }}>
              KES {stats.monthRev.toLocaleString()}
            </p>
          </div>
          <LineChart data={monthlyRev} color="#4ade80" />
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', color: MUTED }}>Monthly Target</span>
              <span style={{ fontSize: '10px', color: TEXT, fontWeight: 700 }}>{targetPct}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width: `${targetPct}%`, height: '100%', borderRadius: '99px',
                background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 0 8px rgba(99,102,241,0.6)',
              }} />
            </div>
            <p style={{ fontSize: '9px', color: MUTED, margin: '4px 0 0' }}>
              KES {stats.monthRev.toLocaleString()} of KES {monthlyTarget.toLocaleString()} target
            </p>
          </div>
        </div>

        {/* Revenue by Service — now from payment categories */}
        <div style={{ ...card, animation: 'fadeUp 0.5s 0.3s ease both' }}>
          <p style={lbl}>Revenue by Category</p>
          {serviceBreakdown.length === 0 ? (
            <p style={{ fontSize: '11px', color: MUTED, textAlign: 'center', padding: '16px 0', margin: 0 }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <DonutChart slices={serviceBreakdown} size={80} />
              <div style={{ flex: 1 }}>
                {serviceBreakdown.slice(0, 5).map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                      <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', marginTop: '2px' }}>
                        <div style={{ width: `${Math.round((s.value / serviceBreakdown[0].value) * 100)}%`, height: '100%', background: s.color, borderRadius: '99px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fleet + Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ ...card, animation: 'fadeUp 0.5s 0.35s ease both' }}>
            <p style={lbl}>Fleet Status</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { val: stats.onTripVeh, label: 'On Trip', color: '#fbbf24' },
                { val: stats.availableVeh, label: 'Available', color: '#4ade80' },
                { val: stats.totalVeh, label: 'Total', color: '#818cf8' },
              ].map(f => (
                <div key={f.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: f.color, margin: '0 0 2px', letterSpacing: '-0.02em', textShadow: `0 0 12px ${f.color}55` }}>{f.val}</p>
                  <p style={{ fontSize: '9px', color: MUTED, margin: 0 }}>{f.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...card, animation: 'fadeUp 0.5s 0.4s ease both' }}>
            <p style={lbl}>Quick Stats</p>
            {[
              { label: 'Pending', val: `${stats.pendPay} payments`, color: '#fbbf24' },
              { label: 'Overdue', val: `KES ${leasingBalance.toLocaleString()}`, color: '#f43f5e' },
              { label: 'Leasing Payouts', val: `KES ${stats.totalPayouts.toLocaleString()}`, color: '#c084fc' },
              { label: 'Other Expenses', val: `KES ${stats.totalOtherExpenses.toLocaleString()}`, color: '#fb923c' },
            ].map(q => (
              <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: MUTED }}>{q.label}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: q.color, textShadow: `0 0 8px ${q.color}44` }}>{q.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: TABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', flex: 1, minHeight: 0 }}>

        {/* Recent Reservations */}
        <div style={{ ...card, animation: 'fadeUp 0.5s 0.45s ease both', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
            <p style={{ ...lbl, margin: 0 }}>Recent Reservations</p>
            <a href="/reservations" style={{ fontSize: '10px', color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>View all →</a>
          </div>
          <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {['Customer', 'Service', 'Amount', 'Status'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRes.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: MUTED, fontSize: '11px' }}>No reservations yet</td></tr>
                ) : recentRes.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/reservations/${r.id}`}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#e8eaf0' }}>{customerMap[r.customer] || '-'}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.4)' }}>{r.service_type || '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#4ade80' }}>{formatKES(r.amount || 0)}</td>
                    <td style={tdStyle}><PaymentBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments — now with Category column */}
        <div style={{ ...card, animation: 'fadeUp 0.5s 0.5s ease both', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
            <p style={{ ...lbl, margin: 0 }}>Recent Payments</p>
            <a href="/payments" style={{ fontSize: '10px', color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>View all →</a>
          </div>
          <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  {['Category', 'Amount', 'Method', 'Status'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPay.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: MUTED, fontSize: '11px' }}>No payments yet</td></tr>
                ) : recentPay.map(p => {
                  const expense = !isRevenue(p)
                  return (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/payments`}>
                      <td style={{ ...tdStyle }}>
                        <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {p.category || '-'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: expense ? '#f87171' : '#4ade80', whiteSpace: 'nowrap' }}>
                        {expense ? '- ' : '+ '}{formatKES(p.amount || 0)}
                      </td>
                      <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.4)' }}>{p.method || '-'}</td>
                      <td style={tdStyle}><PaymentBadge status={p.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}