import { useMemo, useState } from 'react'
import { formatMoney } from '../utils/loanMath'

const WIDTH = 640
const HEIGHT = 300
const PAD = { top: 20, right: 18, bottom: 32, left: 60 }
// Axis gridline labels stay rounded to whole pounds -- £11,250 reads faster
// on a ruler than £11,250.37, and the gridline was never an exact value to
// begin with. The tooltip (exact values on hover) uses formatMoney instead.
const axisFmt = (n) => `£${Math.round(n).toLocaleString('en-GB')}`

// series: [{ label, color, dash, data: [{month, balance}] }]
// Always series[0] = the current plan. series[1], if present, is the
// "with extra payments" what-if -- drawn dashed, same colour family, so the
// two read as the same loan under two futures rather than two unrelated lines.
export default function RepaymentChart({ series }) {
  const [hoverMonth, setHoverMonth] = useState(null)

  const maxMonth = useMemo(
    () => Math.max(1, ...series.map((s) => s.data[s.data.length - 1]?.month ?? 0)),
    [series]
  )
  const maxBalance = useMemo(
    () => Math.max(1, ...series.map((s) => s.data[0]?.balance ?? 0)),
    [series]
  )

  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const xFor = (month) => PAD.left + (month / maxMonth) * plotW
  const yFor = (balance) => PAD.top + (1 - balance / maxBalance) * plotH

  const linePath = (data) => data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.month)} ${yFor(p.balance)}`).join(' ')

  // Balance at a given month for a series, holding at 0 once it's paid off.
  function balanceAt(data, month) {
    if (month >= data[data.length - 1].month) return data[data.length - 1].balance
    const idx = Math.min(month, data.length - 1)
    return data[idx]?.balance ?? 0
  }

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    const month = Math.round(((x - PAD.left) / plotW) * maxMonth)
    setHoverMonth(Math.max(0, Math.min(maxMonth, month)))
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxBalance * f))
  const yearStep = maxMonth > 36 ? 24 : 12
  const xTicks = []
  for (let m = 0; m <= maxMonth; m += yearStep) xTicks.push(m)

  return (
    <div className="chart-wrap">
      {series.length > 1 && (
        <div className="chart-legend">
          {series.map((s) => (
            <span key={s.label} className="chart-legend-item">
              <svg width="20" height="10" aria-hidden="true">
                <line x1="0" y1="5" x2="20" y2="5" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dash || ''} strokeLinecap="round" />
              </svg>
              {s.label}
            </span>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="chart-svg"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverMonth(null)}
        role="img"
        aria-label="Loan balance over time"
      >
        {/* gridlines + y labels */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={yFor(v)} y2={yFor(v)} className="chart-grid" />
            <text x={PAD.left - 10} y={yFor(v) + 4} textAnchor="end" className="chart-axis-label">{axisFmt(v)}</text>
          </g>
        ))}

        {/* x labels */}
        {xTicks.map((m) => (
          <text key={m} x={xFor(m)} y={HEIGHT - PAD.bottom + 20} textAnchor="middle" className="chart-axis-label">
            {m === 0 ? 'Now' : `Yr ${Math.round(m / 12)}`}
          </text>
        ))}

        {/* the lines, longest first so the shorter "paid off sooner" line draws on top */}
        {series.map((s) => (
          <path key={s.label} d={linePath(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dash || ''} strokeLinejoin="round" />
        ))}

        {/* end markers: where each line finishes (paid off, or chart edge) */}
        {series.map((s) => {
          const last = s.data[s.data.length - 1]
          return (
            <circle key={s.label + '-end'} cx={xFor(last.month)} cy={yFor(last.balance)} r="4" fill={s.color} />
          )
        })}

        {/* hover crosshair */}
        {hoverMonth !== null && (
          <g>
            <line x1={xFor(hoverMonth)} x2={xFor(hoverMonth)} y1={PAD.top} y2={HEIGHT - PAD.bottom} className="chart-crosshair" />
            {series.map((s) => (
              <circle key={s.label + '-hover'} cx={xFor(hoverMonth)} cy={yFor(balanceAt(s.data, hoverMonth))} r="4.5" fill={s.color} stroke="var(--bg)" strokeWidth="1.5" />
            ))}
          </g>
        )}
      </svg>

      {hoverMonth !== null && (
        <div className="chart-tooltip">
          <strong>{hoverMonth === 0 ? 'Now' : `Month ${hoverMonth}`}</strong>
          {series.map((s) => (
            <p key={s.label}>
              <span className="chart-dot" style={{ background: s.color }} />
              {s.label}: {formatMoney(balanceAt(s.data, hoverMonth))}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
