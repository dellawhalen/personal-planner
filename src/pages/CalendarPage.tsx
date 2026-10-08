import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import { db } from '../lib/db'
import { usePlanner } from '../context/planner-context'
import type { CalendarEventItem } from '../types'

const emptyEvent = {
  title: '',
  start: new Date().toISOString().slice(0, 16),
  end: '',
  allDay: false,
  category: 'personal',
  notes: '',
  location: '',
}

export default function CalendarPage() {
  const { events, refreshData } = usePlanner()
  const [form, setForm] = useState(emptyEvent)

  const calendarEvents = events.map((event) => ({
    id: String(event.id),
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: event.category === 'creative' ? '#e9b1c8' : event.category === 'social' ? '#a9b7a4' : '#79525f',
    borderColor: '#ffffff',
  }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) return

    const newEvent: CalendarEventItem = {
      id: Date.now(),
      title: form.title,
      start: form.allDay ? form.start.slice(0, 10) : form.start,
      end: form.end || undefined,
      allDay: form.allDay,
      category: form.category,
      notes: form.notes,
      location: form.location,
    }

    await db.events.put(newEvent)
    await refreshData()
    setForm(emptyEvent)
  }

  const handleEventDrop = async (info: { event: { id: string; startStr: string; endStr: string | null; allDay: boolean } }) => {
    const eventId = Number(info.event.id)
    await db.events.update(eventId, {
      start: info.event.startStr,
      end: info.event.endStr || undefined,
      allDay: info.event.allDay,
    })
    await refreshData()
  }

  const handleEventResize = async (info: { event: { id: string; startStr: string; endStr: string | null } }) => {
    const eventId = Number(info.event.id)
    await db.events.update(eventId, {
      start: info.event.startStr,
      end: info.event.endStr || undefined,
    })
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Calendar</h1>
        <div className="overflow-hidden rounded-[22px] border border-[#f0e7e2] bg-[#fffdfa] p-2">
          <FullCalendar
            plugins={[dayGridPlugin as any, timeGridPlugin as any, interactionPlugin as any]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            selectable
            editable
            events={calendarEvents}
            select={(info) => setForm({ ...form, start: info.startStr, end: info.endStr || '', allDay: info.allDay })}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height={650}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-serif text-3xl text-charcoal">Add event</h2>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Event title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <input type="datetime-local" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="datetime-local" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <label className="flex items-center gap-2 rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <input checked={form.allDay} onChange={(event) => setForm({ ...form, allDay: event.target.checked })} type="checkbox" />
            All-day event
          </label>
          <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Location" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes" className="min-h-[100px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">Save event</button>
        </form>
      </section>
    </div>
  )
}
