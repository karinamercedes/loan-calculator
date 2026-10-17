import { formatMonths } from '../utils/loanMath'

const fmt = (n) => `£${Number(n).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`

export default function Summary({ analysis, hasAlreadyPaid }) {
  if (!analysis) return null
  const { payment, totalInterest, currentBalance, remainingTermMonths, interestPaidSoFar, stuck } = analysis

  if (stuck) {
    return (
      <section className="section">
        <p className="muted warn">
          At this rate the payment doesn't even cover a month's interest, so this loan
          would never pay itself off -- try a longer term or check the interest rate.
        </p>
      </section>
    )
  }

  return (
    <section className="section">
      <h2>The <span className="accent-word">numbers</span></h2>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="muted">Monthly payment</p>
          <strong>{fmt(payment)}</strong>
        </div>
        <div className="stat-card">
          <p className="muted">{hasAlreadyPaid ? 'Remaining balance' : 'Total interest'}</p>
          <strong>{fmt(hasAlreadyPaid ? currentBalance : totalInterest)}</strong>
        </div>
        <div className="stat-card">
          <p className="muted">Time left to pay it off</p>
          <strong>{formatMonths(remainingTermMonths)}</strong>
        </div>
      </div>
      {hasAlreadyPaid && (
        <p className="muted" style={{ marginTop: 20 }}>
          You've paid about {fmt(interestPaidSoFar)} in interest so far, and
          {' '}{fmt(totalInterest - interestPaidSoFar)} of interest is still ahead of you
          if nothing changes.
        </p>
      )}
    </section>
  )
}
