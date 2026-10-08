import { useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

import { db } from '../lib/db'
import { formatLocalDate, formatLocalDateLabel } from '../lib/local-date'
import { usePlanner } from '../context/use-planner'
import type { MoodEntry, MoodScore } from '../types'

const moodOptions: { value: MoodScore; label: string; emoji: string }[] = [
  { value: 1, label: 'Heavy', emoji: '😶' },
  { value: 2, label: 'Low', emoji: '🙂' },
  { value: 3, label: 'Steady', emoji: '😊' },
  { value: 4, label: 'Bright', emoji: '😌' },
  { value: 5, label: 'Radiant', emoji: '✨' },
]

export default function MoodPage() {
  const { moodEntries, refreshData } = usePlanner()
  const [score, setScore] = useState<MoodScore>(3)
  const [note, setNote] = useState('')
  const [tags, setTags] = useState('')

  const chartData = useMemo(
    () =>
      [...moodEntries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((entry) => ({
          date: formatLocalDateLabel(entry.date),
          score: entry.score,
        })),
    [moodEntries],
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const entry: MoodEntry = {
      id: Date.now(),
      date: formatLocalDate(),
      score,
      note: note.trim() || undefined,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    await db.moodEntries.put(entry)
    await refreshData()
    setNote('')
    setTags('')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Mood tracker</h1>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">How are you really feeling today?</p>
            <div className="flex flex-wrap gap-3">
              {moodOptions.map((option) => (
                <button key={option.value} type="button" onClick={() => setScore(option.value)} className={`rounded-2xl border px-3 py-2 ${score === option.value ? 'border-berry bg-[#f4edf0] text-berry' : 'border-[#f0e7e2] bg-[#fffdfa] text-charcoal'}`}>
                  <span className="mr-2 text-xl">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note: what needs gentle attention today?" className="min-h-[110px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags (optional)" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
            <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white">Log mood</button>
          </div>

          <div className="rounded-[26px] border border-[#f0e7e2] bg-[#fffdfa] p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-charcoal/55">Mood history</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e7e2" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#e9b1c8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
