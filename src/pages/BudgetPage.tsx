import { useMemo, useState } from 'react'

import { db } from '../lib/db'
import { usePlanner } from '../context/planner-context'
import type { BudgetTransaction, BudgetType } from '../types'

const defaultForm = {
  type: 'expense' as BudgetType,
  amount: '',
  category: '',
  note: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function BudgetPage() {
  const { transactions, refreshData } = usePlanner()
  const [form, setForm] = useState(defaultForm)

  const summary = useMemo(() => {
    const income = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0)
    const expense = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0)
    return { income, expense, remaining: income - expense }
  }, [transactions])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.amount || !form.category.trim()) return

    const transaction: BudgetTransaction = {
      id: Date.now(),
      type: form.type,
      amount: Number(form.amount) * 100,
      category: form.category.trim(),
      note: form.note.trim() || 'No note',
      date: form.date,
    }

    await db.transactions.put(transaction)
    await refreshData()
    setForm(defaultForm)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Budget tracker</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-[#eef3ea] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Income</p>
            <p className="mt-2 font-serif text-4xl text-charcoal">${(summary.income / 100).toLocaleString()}</p>
          </div>
          <div className="rounded-[24px] bg-[#f4ecf0] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Expenses</p>
            <p className="mt-2 font-serif text-4xl text-charcoal">${(summary.expense / 100).toLocaleString()}</p>
          </div>
          <div className="rounded-[24px] bg-[#f8efe9] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Remaining</p>
            <p className="mt-2 font-serif text-4xl text-berry">${(summary.remaining / 100).toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as BudgetType })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Amount" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Note" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">Save transaction</button>
        </form>
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
                  {transaction.type === 'income' ? '+' : '-'}${(transaction.amount / 100).toLocaleString()}
                </p>
                <p className="text-sm text-charcoal/60">{transaction.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
