# Loan Calculator

A free, no-signup tool for working out what a loan actually costs -- the monthly payment, the total interest over its life, and what the balance looks like over time -- plus a simulator for what paying a bit extra would actually save you.

**Live demo:** https://loan-calculator-hazel-sigma.vercel.app/
**Repo:** https://github.com/karinamercedes/loan-calculator 

## Why this exists

Most loan calculators either need you to already know what APR and compounding mean, or they bury the one question people actually have: "if I throw some extra money at this, how much sooner am I done, and how much interest does that actually save?" This tool answers that directly, with a chart that shows the two futures side by side.

## Features

- Monthly payment and total interest, worked out from amount, APR and term
- "How long you've had it" field, so it shows where the loan stands today rather than only day one
- A balance-over-time chart (hand-rolled SVG, no charting library) with a hover crosshair and tooltip
- An extra-payment simulator -- a recurring monthly top-up and/or a one-off lump sum -- showing time and interest saved, with a second line on the chart for comparison
- Reset button, everything saved in the browser, no account needed

## Tech stack

React + Vite. No backend, no paid services, nothing external except Google Fonts.

## Run it locally

```bash
npm install
npm run dev
```
Open the address it prints (usually http://localhost:5173).

## Project structure

```
src/
  components/   LoanForm, Summary, RepaymentChart, ExtraPaymentForm
  hooks/        useLocalStorage.js
  utils/        loanMath.js (the amortization engine)
  App.jsx
```

## How the maths works

`utils/split.js`'s equivalent here is `utils/loanMath.js` -- plain JavaScript, no React, so it can be reasoned about (and tested) on its own.

It's standard monthly-compounding amortization: each month, interest accrues on whatever balance is left, the fixed payment covers that interest first, and the rest chips into the principal. `buildSchedule()` walks that month by month; `analyzeLoan()` uses it to answer "what does this loan look like today," including after some months have already been paid as normal; `simulateExtra()` reuses the same engine on the current balance to compare the stock schedule against one with an extra monthly amount and/or a lump sum added now.

A payment that doesn't even cover the first month's interest would loop forever trying to find a payoff date that doesn't exist -- `buildSchedule()` catches that case (`stuck: true`) and the UI shows a message instead of a broken chart.

**Known limitations:** assumes monthly compounding throughout (the common case for personal/car loans and mortgages); doesn't currently model variable/tracker rates that change partway through, or UK-style income-contingent student loan repayment, which works completely differently (repayment tied to salary, not loan size, with a 30-40 year write-off).

## Roadmap

- [x] Monthly payment, total interest, balance-over-time chart
- [x] "Already paid some" recalculation
- [x] Extra-payment / lump-sum simulator with comparison chart line
- [ ] Downloadable/printable amortization schedule
- [ ] Variable-rate support
