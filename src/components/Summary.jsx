import { formatMoney, formatMonths } from '../utils/loanMath'

export default function Summary({ analysis }) {
  if (!analysis) return null
  const { payment, currentBalance, remainingTermMonths, totalRepaymentRemaining, interestRemaining, stuck } = analysis

  if (stuck) {
    return (
      <section className="section">
        <p className="muted warn">
          At this rate the payment doesn't even cover a month's interest, so this loan
          would never pay itself off - try a longer term or check the interest rate.
        </p>
      </section>
    )
  }

  return (
    <>
      <section className="section">
        <h2>Today's <span className="accent-word">numbers</span></h2>
        <div className="stat-grid">
          <div className="stat-card">
            <p className="muted">Monthly payment</p>
            <strong>{formatMoney(payment)}</strong>
          </div>
          <div className="stat-card">
            <p className="muted">Remaining balance, as of today</p>
            <strong>{formatMoney(currentBalance)}</strong>
          </div>
          <div className="stat-card">
            <p className="muted">Time left to pay it off</p>
            <strong>{formatMonths(remainingTermMonths)}</strong>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 20 }}>
          "As of today" matters here: {formatMoney(currentBalance)} is what you'd owe if you
          cleared this loan in one go right now.
        </p>
      </section>

      <section className="section">
        <h2>Over <span className="accent-word">time</span></h2>
        <div className="stat-grid">
          <div className="stat-card">
            <p className="muted">Total repayment remaining</p>
            <strong>{formatMoney(totalRepaymentRemaining)}</strong>
          </div>
          <div className="stat-card">
            <p className="muted">of which, interest</p>
            <strong>{formatMoney(interestRemaining)}</strong>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 20 }}>
          If you don't, and instead keep paying it off over the time you have left, you'll
          hand back {formatMoney(totalRepaymentRemaining)} in total from here - that figure
          includes the {formatMoney(currentBalance)} balance plus the {formatMoney(interestRemaining)}
          {' '}of interest still to come.
        </p>
      </section>
    </>
  )
}
