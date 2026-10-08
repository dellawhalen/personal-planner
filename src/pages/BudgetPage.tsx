import { useMemo, useState } from 'react'

import { db } from '../lib/db'
import { formatLocalDate } from '../lib/local-date'
import { usePlanner } from '../context/use-planner'
import { calculateBudgetTotals, formatCurrency, parseCurrencyToCents, withBudgetRemaining } from '../lib/money'
import type { BudgetTransaction, BudgetType } from '../types'

const defaultForm = {
  type: 'expense' as BudgetType,
  amount: '',
  category: '',
  note: '',
  date: formatLocalDate(),
}

export default function BudgetPage() {
  const { transactions, refreshData } = usePlanner()
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')

  const summary = useMemo(() => {
    return withBudgetRemaining(calculateBudgetTotals(transactions))
  }, [transactions])
  const unresolvedAmountCount = transactions.filter((transaction) => transaction.unitNeedsReview || transaction.amountCents === null).length

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const amountCents = parseCurrencyToCents(form.amount)
    if (!form.category.trim() || amountCents === null || amountCents <= 0) {
      setError('Enter a category and a positive amount with up to two decimal places.')
      return
    }

    const transaction: BudgetTransaction = {
      id: Date.now(),
      type: form.type,
      amountCents,
      category: form.category.trim(),
      note: form.note.trim() || 'No note',
      date: form.date,
    }

    await db.transactions.put(transaction)
    await refreshData()
    setForm(defaultForm)
    setError('')
  }

  const resolveLegacyAmount = async (transaction: BudgetTransaction, unit: 'cents' | 'dollars') => {
    if (transaction.legacyAmount === undefined) return
    const amountCents = unit === 'cents'
      ? Math.round(transaction.legacyAmount)
      : Math.round(transaction.legacyAmount * 100)
    await db.transactions.update(transaction.id, { amountCents, unitNeedsReview: false })
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Budget tracker</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-[#eef3ea] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Income</p>
            <p className="mt-2 font-serif text-4xl text-charcoal">{formatCurrency(summary.incomeCents)}</p>
          </div>
          <div className="rounded-[24px] bg-[#f4ecf0] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Expenses</p>
            <p className="mt-2 font-serif text-4xl text-charcoal">{formatCurrency(summary.expenseCents)}</p>
          </div>
          <div className="rounded-[24px] bg-[#f8efe9] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Remaining</p>
            <p className="mt-2 font-serif text-4xl text-berry">{formatCurrency(summary.remainingCents)}</p>
          </div>
        </div>
        {unresolvedAmountCount > 0 && (
          <p role="status" className="mt-4 rounded-xl border border-dotted border-[#d8b9c5] bg-[#fff8fa] px-4 py-3 text-sm text-berry">
            {unresolvedAmountCount} historical {unresolvedAmountCount === 1 ? 'amount needs' : 'amounts need'} a unit choice and {unresolvedAmountCount === 1 ? 'is' : 'are'} not included in these totals. Review the original values below.
          </p>
        )}
      </section>

      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as BudgetType })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Amount" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Note" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">Save transaction</button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-berry">{error}</p>}
      </section>

      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
              <div>
                <p className="font-medium text-charcoal">{transaction.category}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-charcoal/50">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${transaction.type === 'income' ? 'text-sage' : 'text-berry'}`}>
                  {transaction.unitNeedsReview || transaction.amountCents === null
                    ? `Needs review · original value ${transaction.legacyAmount}`
                    : `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amountCents)}`}
                </p>
                <p className="text-sm text-charcoal/60">{transaction.note}</p>
                {transaction.unitNeedsReview && (
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => void resolveLegacyAmount(transaction, 'cents')} className="text-xs text-charcoal underline">Treat as cents</button>
                    <button type="button" onClick={() => void resolveLegacyAmount(transaction, 'dollars')} className="text-xs text-charcoal underline">Treat as dollars</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
