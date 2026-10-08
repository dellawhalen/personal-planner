import { useMemo, useState } from 'react'

import { db } from '../lib/db'
import { usePlanner } from '../context/planner-context'
import type { Countdown } from '../types'

const initialForm = {
  title: '',
  date: '',
  time: '',
  category: 'travel',
  accent: '#79525f',
  notes: '',
}

function getCountdownLabel(target: string, time?: string) {
  const end = new Date(`${target}${time ? `T${time}` : ''}`)
  const diff = end.getTime() - Date.now()
  if (Number.isNaN(diff)) return 'Date not set'

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'This is here now'
  return `${days} days left`
}

export default function CountdownPage() {
  const { countdowns, refreshData } = usePlanner()
  const [form, setForm] = useState(initialForm)

  const countdownCards = useMemo(() => countdowns, [countdowns])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.date) return

    const countdown: Countdown = {
      id: Date.now(),
      title: form.title.trim(),
      date: form.date,
      time: form.time || undefined,
      category: form.category,
      accent: form.accent,
      notes: form.notes,
    }

    await db.countdowns.put(countdown)
    await refreshData()
    setForm(initialForm)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Countdown tracker</h1>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="color" value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })} className="h-[52px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-2 py-2" />
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes" className="min-h-[110px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">Save countdown</button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {countdownCards.map((countdown) => (
          <article key={countdown.id} className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm" style={{ borderTop: `4px solid ${countdown.accent}` }}>
            <div className="flex items-center justify-between">
              <span className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-charcoal/55" style={{ backgroundColor: `${countdown.accent}20` }}>{countdown.category}</span>
            </div>
            <h3 className="mt-4 font-serif text-3xl text-charcoal">{countdown.title}</h3>
            <p className="mt-3 text-sm text-charcoal/70">{countdown.date} {countdown.time ? `at ${countdown.time}` : ''}</p>
            <p className="mt-4 font-serif text-4xl text-berry">{getCountdownLabel(countdown.date, countdown.time)}</p>
            {countdown.notes && <p className="mt-3 text-sm text-charcoal/60">{countdown.notes}</p>}
          </article>
        ))}
      </section>
    </div>
  )
}
