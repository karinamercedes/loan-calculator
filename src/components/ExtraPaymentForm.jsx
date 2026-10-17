import { formatMoney, formatMonths } from '../utils/loanMath'

export default function ExtraPaymentForm({ extra, onChange, result }) {
  function set(field, value) {
    onChange({ ...extra, [field]: value })
  }

  return (
    <section className="section">
      <h2>What if you paid <span className="accent-word">extra</span>?</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        See what a bit more each month, or a one-off lump sum right now, actually buys you.
      </p>
      <div className="grid extra-grid">
        <label>
          Extra per month (£)
          <input
            type="number" min="0" step="0.01"
            value={extra.extraMonthly}
            onChange={(e) => set('extraMonthly', e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label>
          One-off lump sum now (£)
          <input
            type="number" min="0" step="0.01"
            value={extra.lumpSum}
            onChange={(e) => set('lumpSum', e.target.value)}
            placeholder="0.00"
          />
        </label>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>
        Use a full stop for the pence (e.g. 50.00), not a comma.
      </p>

      {result && (result.monthsSaved > 0 || result.interestSaved > 0) && (
        <div className="stat-grid" style={{ marginTop: 32 }}>
          <div className="stat-card">
            <p className="muted">Paid off</p>
            <strong className="accent-word">{formatMonths(result.monthsSaved)} sooner</strong>
          </div>
          <div className="stat-card">
            <p className="muted">Interest saved</p>
            <strong className="accent-word">{formatMoney(result.interestSaved)}</strong>
          </div>
        </div>
      )}
      {result && result.monthsSaved <= 0 && result.interestSaved <= 0 && (Number(extra.extraMonthly) > 0 || Number(extra.lumpSum) > 0) && (
        <p className="muted" style={{ marginTop: 16 }}>That doesn't change your payoff - try a larger amount.</p>
      )}
    </section>
  )
}
