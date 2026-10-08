import { useMemo, useState } from 'react'

import { db } from '../lib/db'
import { createRecordId } from '../lib/ids'
import { parseLocalDateTime } from '../lib/local-date'
import { usePlanner } from '../context/use-planner'
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
  const end = parseLocalDateTime(target, time || '00:00')
  if (!end) return 'Date not set'
  const diff = end.getTime() - Date.now()

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'This is here now'
  return `${days} days left`
}

export default function CountdownPage() {
  const { countdowns, refreshData } = usePlanner()
  const [form, setForm] = useState(initialForm)
  const [editingCountdownId, setEditingCountdownId] = useState<number | null>(null)

  const countdownCards = useMemo(() => countdowns, [countdowns])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.date) return

    const existingCountdown = editingCountdownId === null ? undefined : countdowns.find((item) => item.id === editingCountdownId)
    const countdown: Countdown = {
      ...existingCountdown,
      id: editingCountdownId ?? createRecordId(),
      title: form.title.trim(),
      date: form.date,
      time: form.time || undefined,
      category: form.category,
      accent: form.accent,
      notes: form.notes,
    }

    await db.countdowns.put(countdown)
    await refreshData()
    setEditingCountdownId(null)
    setForm(initialForm)
  }

  const beginEdit = (countdown: Countdown) => {
    setEditingCountdownId(countdown.id)
    setForm({
      title: countdown.title,
      date: countdown.date,
      time: countdown.time ?? '',
      category: countdown.category,
      accent: countdown.accent,
      notes: countdown.notes ?? '',
    })
    document.getElementById('countdown-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteCountdown = async (countdown: Countdown) => {
    if (!window.confirm(`Delete “${countdown.title}”? This cannot be undone.`)) return
    await db.countdowns.delete(countdown.id)
    if (editingCountdownId === countdown.id) {
      setEditingCountdownId(null)
      setForm(initialForm)
    }
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section id="countdown-form" className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">{editingCountdownId === null ? 'Countdown tracker' : 'Edit countdown'}</h1>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="color" value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })} className="h-[52px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-2 py-2" />
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes" className="min-h-[110px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">{editingCountdownId === null ? 'Save countdown' : 'Update countdown'}</button>
        </form>
        {editingCountdownId !== null && <button type="button" onClick={() => { setEditingCountdownId(null); setForm(initialForm) }} className="mt-3 rounded-xl border border-[#f0e7e2] px-4 py-2 text-sm text-charcoal/70">Cancel edit</button>}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {countdownCards.map((countdown) => (
          <article key={countdown.id} className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm" style={{ borderTop: `4px solid ${countdown.accent}` }}>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-charcoal/55" style={{ backgroundColor: `${countdown.accent}20` }}>{countdown.category}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => beginEdit(countdown)} className="rounded-full border border-[#f0e7e2] px-3 py-1 text-xs uppercase tracking-[0.12em] text-charcoal/70">Edit</button>
                <button type="button" onClick={() => void deleteCountdown(countdown)} className="rounded-full border border-[#ead8df] px-3 py-1 text-xs uppercase tracking-[0.12em] text-berry">Delete</button>
              </div>
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
