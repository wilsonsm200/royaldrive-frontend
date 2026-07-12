type Props = {
  label: string
  value: string | number
  sub?: string
  accent?: string
  spark?: number[]
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const W = 72, H = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill='none'
        stroke={color}
        strokeWidth='1.5'
        strokeLinejoin='round'
        strokeLinecap='round'
        opacity='0.7'
      />
    </svg>
  )
}

export default function StatCard({ label, value, sub, accent = '#6366f1', spark = [] }: Props) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '16px 18px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0px',
    }}>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: accent,
        borderRadius: '14px 14px 0 0',
      }} />

      <div style={{
        position: 'absolute',
        top: '16px',
        left: 0,
        width: '3px',
        height: '48px',
        background: accent,
        borderRadius: '0 3px 3px 0',
        opacity: 0.3,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '4px' }}>
        <p style={{
          fontSize: '26px',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: '-0.8px',
        }}>
          {value}
        </p>
        {spark.length > 1 && (
          <div style={{ paddingTop: '2px' }}>
            <Sparkline data={spark} color={accent} />
          </div>
        )}
      </div>

      <p style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.55)',
        marginTop: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </p>

      {sub && (
        <p style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.35)',
          marginTop: '3px',
          fontWeight: 500,
        }}>
          {sub}
        </p>
      )}

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: accent,
        opacity: 0.15,
      }} />

    </div>
  )
}