// The repayment maths: standard monthly-compounding amortization, same as a
// mortgage or car loan. Each month: interest accrues on what's left, the
// fixed payment covers that interest first, and whatever's left of the
// payment chips into the balance.

const MAX_MONTHS_SAFETY = 1200 // 100 years -- just a runaway-loop guard

export function monthlyPayment(principal, apr, termMonths) {
  const r = apr / 100 / 12
  if (termMonths <= 0) return 0
  if (r === 0) return principal / termMonths
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths))
}

// Builds a month-by-month schedule. `extraMonthly` and `lumpSum` (applied at
// `lumpSumAtMonth`) let a payment run faster than the loan's own fixed term --
// that's what the "what if I pay extra" simulator reuses this for.
export function buildSchedule({ principal, apr, termMonths, extraMonthly = 0, lumpSum = 0, lumpSumAtMonth = 0 }) {
  const r = apr / 100 / 12
  const payment = monthlyPayment(principal, apr, termMonths)

  // A payment that doesn't even cover month-one's interest never pays the
  // loan off -- flag it instead of looping forever.
  if (payment + extraMonthly <= principal * r && principal * r > 0 && extraMonthly === 0) {
    return { schedule: [{ month: 0, balance: principal, interest: 0, principalPaid: 0 }], payment, totalInterest: 0, monthsToPayoff: Infinity, stuck: true }
  }

  let balance = principal
  const schedule = [{ month: 0, balance, interest: 0, principalPaid: 0 }]
  let month = 0
  let totalInterest = 0

  while (balance > 0.005 && month < Math.max(termMonths * 3, MAX_MONTHS_SAFETY)) {
    month++
    const interest = balance * r
    let principalPaid = payment - interest + extraMonthly
    if (month === lumpSumAtMonth) principalPaid += lumpSum
    if (principalPaid > balance) principalPaid = balance
    if (principalPaid < 0) principalPaid = 0
    balance = Math.max(0, balance - principalPaid)
    totalInterest += interest
    schedule.push({ month, balance, interest, principalPaid })
  }

  return { schedule, payment, totalInterest, monthsToPayoff: month, stuck: false }
}

// The main "tell me about this loan" call: the standard schedule, plus where
// it stands today if some months have already been paid as normal.
export function analyzeLoan({ principal, apr, termMonths, monthsAlreadyPaid = 0 }) {
  const base = buildSchedule({ principal, apr, termMonths })
  const clampedElapsed = Math.min(monthsAlreadyPaid, base.schedule.length - 1)
  const currentBalance = base.schedule[clampedElapsed]?.balance ?? principal
  const remainingTermMonths = Math.max(0, termMonths - monthsAlreadyPaid)
  const interestPaidSoFar = base.schedule.slice(0, clampedElapsed + 1).reduce((s, p) => s + p.interest, 0)

  // Two different totals, both counted from *today* forward, not from the
  // loan's start -- interestRemaining is just the interest still to come,
  // and totalRepaymentRemaining is today's balance plus that interest (i.e.
  // everything still to be handed over if the loan runs to term from here).
  // Neither nets back to the original principal on its own: that only
  // happens once you also add back interestPaidSoFar and the principal
  // already repaid, which is the loan's full lifetime total instead.
  const interestRemaining = base.totalInterest - interestPaidSoFar
  const totalRepaymentRemaining = currentBalance + interestRemaining

  return {
    payment: base.payment,
    totalInterest: base.totalInterest,
    monthsToPayoff: base.monthsToPayoff,
    schedule: base.schedule,
    currentBalance,
    remainingTermMonths,
    interestPaidSoFar,
    interestRemaining,
    totalRepaymentRemaining,
    principal,
    stuck: base.stuck,
  }
}

// The "what if" simulator: from today's balance, compare carrying on as-is
// against adding a recurring extra payment and/or a one-off lump sum now.
export function simulateExtra({ principal, apr, termMonths, monthsAlreadyPaid = 0, extraMonthly = 0, lumpSum = 0 }) {
  const base = buildSchedule({ principal, apr, termMonths })
  const clampedElapsed = Math.min(monthsAlreadyPaid, base.schedule.length - 1)
  const currentBalance = base.schedule[clampedElapsed]?.balance ?? principal
  const remainingTermMonths = Math.max(0, termMonths - monthsAlreadyPaid)

  if (currentBalance <= 0 || remainingTermMonths <= 0) return null

  const withoutExtra = buildSchedule({ principal: currentBalance, apr, termMonths: remainingTermMonths })
  const withExtra = buildSchedule({
    principal: currentBalance,
    apr,
    termMonths: remainingTermMonths,
    extraMonthly,
    lumpSum,
    lumpSumAtMonth: lumpSum > 0 ? 1 : 0,
  })

  return {
    withoutExtra,
    withExtra,
    monthsSaved: withoutExtra.monthsToPayoff - withExtra.monthsToPayoff,
    interestSaved: withoutExtra.totalInterest - withExtra.totalInterest,
  }
}

// Always exact to the penny -- nothing in this app rounds to whole pounds,
// since that's what made an earlier explanation of these numbers look like
// it didn't add up when it actually did.
export function formatMoney(n) {
  return `£${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatMonths(months) {
  if (!Number.isFinite(months)) return 'never, at this rate'
  const years = Math.floor(months / 12)
  const rem = Math.round(months % 12)
  if (years === 0) return `${rem} month${rem === 1 ? '' : 's'}`
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`
  return `${years} year${years === 1 ? '' : 's'}, ${rem} month${rem === 1 ? '' : 's'}`
}
