import { useState } from 'react'

import { db } from '../lib/db'
import { createRecordId } from '../lib/ids'
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
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() && !form.content.trim()) return

    const existingEntry = editingEntryId === null ? undefined : journalEntries.find((item) => item.id === editingEntryId)
    const entry: JournalEntry = {
      ...existingEntry,
      id: editingEntryId ?? createRecordId(),
      title: form.title.trim() || 'Untitled reflection',
      content: form.content,
      date: form.date,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    await db.journalEntries.put(entry)
    await refreshData()
    setEditingEntryId(null)
    setForm(initialEntry)
  }

  const beginEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id)
    setForm({
      title: entry.title,
      content: entry.content,
      tags: entry.tags.join(', '),
      date: entry.date,
    })
    document.getElementById('journal-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteEntry = async (entry: JournalEntry) => {
    if (!window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return
    await db.journalEntries.delete(entry.id)
    if (editingEntryId === entry.id) {
      setEditingEntryId(null)
      setForm(initialEntry)
    }
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section id="journal-editor" className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">{editingEntryId === null ? 'Journal' : 'Edit entry'}</h1>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Entry title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          </div>
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Tags (comma separated)" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write what is blooming in your heart today..." className="min-h-[220px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 leading-7" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white">{editingEntryId === null ? 'Save entry' : 'Update entry'}</button>
        </form>
        {editingEntryId !== null && <button type="button" onClick={() => { setEditingEntryId(null); setForm(initialEntry) }} className="mt-3 rounded-xl border border-[#f0e7e2] px-4 py-2 text-sm text-charcoal/70">Cancel edit</button>}
      </section>

      <section className="space-y-4">
        {journalEntries.map((entry) => (
          <article key={entry.id} className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-charcoal/50">{entry.date}</p>
                <h2 className="mt-2 font-serif text-3xl text-charcoal">{entry.title}</h2>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => beginEdit(entry)} className="rounded-full border border-[#f0e7e2] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-charcoal/70">Edit</button>
                <button type="button" onClick={() => void deleteEntry(entry)} className="rounded-full border border-[#ead8df] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-berry">Delete</button>
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
