export default function LoanForm({ loan, onChange }) {
  function set(field, value) {
    onChange({ ...loan, [field]: value })
  }

  return (
    <form className="section" onSubmit={(e) => e.preventDefault()}>
      <h2>Your <span className="accent-word">loan</span></h2>
      <div className="grid">
        <label className="wide">
          Loan amount (£)
          <input
            type="number" min="0" step="0.01"
            value={loan.principal}
            onChange={(e) => set('principal', e.target.value)}
            placeholder="e.g. 15000.00"
          />
        </label>
        <label>
          Interest rate, APR (%)
          <input
            type="number" min="0" step="0.1"
            value={loan.apr}
            onChange={(e) => set('apr', e.target.value)}
            placeholder="e.g. 6.9"
          />
        </label>
        <label>
          Loan term (years)
          <input
            type="number" min="0" step="0.5"
            value={loan.termYears}
            onChange={(e) => set('termYears', e.target.value)}
            placeholder="e.g. 5"
          />
        </label>
        <label className="wide">
          How long you've had it (months, 0 if brand new)
          <input
            type="number" min="0" step="1"
            value={loan.monthsAlreadyPaid}
            onChange={(e) => set('monthsAlreadyPaid', e.target.value)}
            placeholder="0"
          />
        </label>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>
        Use a full stop for the pence (e.g. 1250.50), not a comma - this page always
        reads amounts the UK/US way, whatever your keyboard or region normally uses.
      </p>
      <p className="muted" style={{ marginTop: 10 }}>
        Assumes you've paid it as scheduled since you took it out - the extra-payment
        tool below is for anything beyond that.
      </p>
    </form>
  )
}
