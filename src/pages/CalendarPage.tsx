import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import { db } from '../lib/db'
import { formatLocalDate, formatLocalDateTimeInput } from '../lib/local-date'
import { usePlanner } from '../context/use-planner'
import type { CalendarEventItem } from '../types'

const emptyEvent = {
  title: '',
  start: formatLocalDateTimeInput(),
  end: '',
  allDay: false,
  category: 'personal',
  notes: '',
  location: '',
}

export default function CalendarPage() {
  const { events, refreshData } = usePlanner()
  const [form, setForm] = useState(emptyEvent)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)

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

    const existingEvent = editingEventId === null ? undefined : events.find((item) => item.id === editingEventId)
    const newEvent: CalendarEventItem = {
      ...existingEvent,
      id: editingEventId ?? Date.now(),
      title: form.title,
      start: form.allDay ? form.start.slice(0, 10) : form.start,
      end: form.end ? (form.allDay ? form.end.slice(0, 10) : form.end) : undefined,
      allDay: form.allDay,
      category: form.category,
      notes: form.notes,
      location: form.location,
    }

    await db.events.put(newEvent)
    await refreshData()
    setForm(emptyEvent)
    setEditingEventId(null)
  }

  const beginEdit = (event: CalendarEventItem) => {
    setEditingEventId(event.id)
    setForm({
      title: event.title,
      start: event.start.length >= 16 ? event.start.slice(0, 16) : `${event.start}T09:00`,
      end: event.end ? (event.end.length >= 16 ? event.end.slice(0, 16) : `${event.end}T10:00`) : '',
      allDay: event.allDay,
      category: event.category,
      notes: event.notes ?? '',
      location: event.location ?? '',
    })
    document.getElementById('calendar-event-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteEvent = async (eventId: number) => {
    const eventToDelete = events.find((event) => event.id === eventId)
    if (!eventToDelete || !window.confirm(`Delete “${eventToDelete.title}”? This cannot be undone.`)) return

    await db.events.delete(eventId)
    if (editingEventId === eventId) {
      setEditingEventId(null)
      setForm(emptyEvent)
    }
    await refreshData()
  }

  const handleEventDrop = async (info: { event: { id: string; start: Date | null; end: Date | null; allDay: boolean } }) => {
    if (!info.event.start) return
    const eventId = Number(info.event.id)
    await db.events.update(eventId, {
      start: info.event.allDay ? formatLocalDate(info.event.start) : formatLocalDateTimeInput(info.event.start),
      end: info.event.end ? (info.event.allDay ? formatLocalDate(info.event.end) : formatLocalDateTimeInput(info.event.end)) : undefined,
      allDay: info.event.allDay,
    })
    await refreshData()
  }

  const handleEventResize = async (info: { event: { id: string; start: Date | null; end: Date | null; allDay: boolean } }) => {
    if (!info.event.start) return
    const eventId = Number(info.event.id)
    await db.events.update(eventId, {
      start: info.event.allDay ? formatLocalDate(info.event.start) : formatLocalDateTimeInput(info.event.start),
      end: info.event.end ? (info.event.allDay ? formatLocalDate(info.event.end) : formatLocalDateTimeInput(info.event.end)) : undefined,
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
            select={(info) => {
              setEditingEventId(null)
              setForm({ ...emptyEvent, start: formatLocalDateTimeInput(info.start), end: info.end ? formatLocalDateTimeInput(info.end) : '', allDay: info.allDay })
            }}
            eventClick={(info) => {
              const selectedEvent = events.find((event) => event.id === Number(info.event.id))
              if (selectedEvent) beginEdit(selectedEvent)
            }}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height={650}
          />
        </div>
      </section>

      <section id="calendar-event-form" className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-3xl text-charcoal">{editingEventId === null ? 'Add event' : 'Edit event'}</h2>
          {editingEventId !== null && <button type="button" onClick={() => { setEditingEventId(null); setForm(emptyEvent) }} className="rounded-xl border border-[#f0e7e2] px-3 py-2 text-sm text-charcoal/70">Cancel edit</button>}
        </div>
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
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Description" className="min-h-[100px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">{editingEventId === null ? 'Save event' : 'Update event'}</button>
        </form>
        {editingEventId !== null && <button type="button" onClick={() => void deleteEvent(editingEventId)} className="mt-3 rounded-xl border border-[#ead8df] px-4 py-2 text-sm text-berry">Delete event</button>}
      </section>
    </div>
  )
}
