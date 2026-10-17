import { useMemo } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import LoanForm from './components/LoanForm'
import Summary from './components/Summary'
import RepaymentChart from './components/RepaymentChart'
import ExtraPaymentForm from './components/ExtraPaymentForm'
import { analyzeLoan, simulateExtra } from './utils/loanMath'

const defaultLoan = { principal: '', apr: '', termYears: '', monthsAlreadyPaid: '0' }
const defaultExtra = { extraMonthly: '', lumpSum: '' }

export default function App() {
  const [loan, setLoan] = useLocalStorage('lc-loan', defaultLoan)
  const [extra, setExtra] = useLocalStorage('lc-extra', defaultExtra)

  const principal = Number(loan.principal) || 0
  const apr = Number(loan.apr) || 0
  const termMonths = Math.round((Number(loan.termYears) || 0) * 12)
  const monthsAlreadyPaid = Math.max(0, Math.min(Number(loan.monthsAlreadyPaid) || 0, Math.max(termMonths - 1, 0)))
  const isValid = principal > 0 && termMonths > 0

  const analysis = useMemo(
    () => (isValid ? analyzeLoan({ principal, apr, termMonths, monthsAlreadyPaid }) : null),
    [isValid, principal, apr, termMonths, monthsAlreadyPaid]
  )

  const extraMonthly = Number(extra.extraMonthly) || 0
  const lumpSum = Number(extra.lumpSum) || 0

  const extraResult = useMemo(
    () => (isValid && analysis && !analysis.stuck
      ? simulateExtra({ principal, apr, termMonths, monthsAlreadyPaid, extraMonthly, lumpSum })
      : null),
    [isValid, analysis, principal, apr, termMonths, monthsAlreadyPaid, extraMonthly, lumpSum]
  )

  const hasExtra = extraMonthly > 0 || lumpSum > 0

  const chartSeries = useMemo(() => {
    if (!extraResult) return []
    const toPoints = (s) => s.schedule.map((p) => ({ month: p.month, balance: p.balance }))
    const series = [{ label: 'Current plan', color: 'var(--teal)', dash: '', data: toPoints(extraResult.withoutExtra) }]
    if (hasExtra) {
      series.push({ label: 'With extra payments', color: 'var(--accent)', dash: '6 4', data: toPoints(extraResult.withExtra) })
    }
    return series
  }, [extraResult, hasExtra])

  function reset() {
    setLoan(defaultLoan)
    setExtra(defaultExtra)
  }

  return (
    <main className="app">
      <header>
        <h1>Loan <span className="accent-word">Calculator</span></h1>
        <p className="subhead">Work out what a loan really costs, and what paying extra would actually save you.</p>
      </header>

      <LoanForm loan={loan} onChange={setLoan} />

      {isValid ? (
        <>
          <Summary analysis={analysis} hasAlreadyPaid={monthsAlreadyPaid > 0} />

          {chartSeries.length > 0 && !analysis.stuck && (
            <section className="section">
              <h2>Balance over <span className="accent-word">time</span></h2>
              <RepaymentChart series={chartSeries} />
            </section>
          )}

          {!analysis.stuck && (
            <ExtraPaymentForm extra={extra} onChange={setExtra} result={extraResult} />
          )}
        </>
      ) : (
        <p className="empty">Enter a loan amount and term above to see the numbers.</p>
      )}

      <div className="plan-controls">
        <button type="button" className="link-reset" onClick={reset}>Reset</button>
      </div>
    </main>
  )
}
