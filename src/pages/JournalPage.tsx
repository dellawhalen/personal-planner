import { useState } from 'react'

import { db } from '../lib/db'
import { formatLocalDate } from '../lib/local-date'
import { usePlanner } from '../context/use-planner'
import type { JournalEntry } from '../types'

const initialEntry = {
  title: '',
  content: '',
  tags: '',
  date: formatLocalDate(),
}

export default function JournalPage() {
  const { journalEntries, refreshData } = usePlanner()
  const [form, setForm] = useState(initialEntry)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() && !form.content.trim()) return

    const entry: JournalEntry = {
      id: Date.now(),
      title: form.title.trim() || 'Untitled reflection',
      content: form.content,
      date: form.date,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    await db.journalEntries.put(entry)
    await refreshData()
    setForm(initialEntry)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Journal</h1>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Entry title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          </div>
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Tags (comma separated)" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write what is blooming in your heart today..." className="min-h-[220px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 leading-7" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white">Save entry</button>
        </form>
      </section>

      <section className="space-y-4">
        {journalEntries.map((entry) => (
          <article key={entry.id} className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-charcoal/50">{entry.date}</p>
                <h2 className="mt-2 font-serif text-3xl text-charcoal">{entry.title}</h2>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-charcoal/80">{entry.content}</p>
            {entry.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-berry">
                {entry.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f5ebef] px-2.5 py-1">{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}
