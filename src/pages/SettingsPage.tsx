import { useState } from 'react'

import { resetDatabase } from '../lib/db'
import { createPlannerBackup, getBackupErrorMessage, restorePlannerBackup } from '../lib/backup'
import { usePlanner } from '../context/use-planner'

const accentPresets = ['#e9b1c8', '#a9b7a4', '#79525f', '#28252a', '#e8d9c9']

export default function SettingsPage() {
  const { preferences, updatePreferences, goals, tasks, events, journalEntries, moodEntries, transactions, countdowns, refreshData } = usePlanner()
  const [importText, setImportText] = useState('')
  const [status, setStatus] = useState('')

  const handleExport = async () => {
    const payload = createPlannerBackup({
      goals,
      tasks,
      events,
      journalEntries,
      moodEntries,
      transactions,
      countdowns,
      preferences,
    })

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'a-life-in-bloom-backup.json'
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Backup exported successfully.')
  }

  const handleImport = async () => {
    try {
      await restorePlannerBackup(JSON.parse(importText) as unknown)
      await refreshData()
      setStatus('Data imported successfully.')
      setImportText('')
    } catch (error) {
      setStatus(getBackupErrorMessage(error))
    }
  }

  const handleResetAppearance = async () => {
    await updatePreferences({ ...preferences, accent: '#e9b1c8', layoutPreset: 'balanced', animationLevel: 1, showDecorativeElements: true })
    setStatus('Appearance restored to the default bloom palette.')
  }

  const handleResetDatabase = async () => {
    await resetDatabase()
    await refreshData()
    setStatus('Planner data has been reset to the default starter collection.')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h1 className="mb-4 font-serif text-4xl text-charcoal">Personalization settings</h1>

        <div className="mb-6 max-w-xl">
          <label htmlFor="site-name" className="mb-3 block text-xs uppercase tracking-[0.18em] text-charcoal/55">Website name</label>
          <input id="site-name" value={preferences.siteName} onChange={(event) => void updatePreferences({ ...preferences, siteName: event.target.value })} className="w-full rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-charcoal/55">Accent colors</p>
            <div className="flex flex-wrap gap-3">
              {accentPresets.map((accent) => (
                <button key={accent} type="button" onClick={() => void updatePreferences({ ...preferences, accent })} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: accent }} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-charcoal/55">Greeting</p>
            <input value={preferences.greeting} onChange={(event) => void updatePreferences({ ...preferences, greeting: event.target.value })} className="w-full rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-charcoal/55">Layout preset</p>
          <select value={preferences.layoutPreset} onChange={(event) => void updatePreferences({ ...preferences, layoutPreset: event.target.value as 'balanced' | 'productivity' | 'dreamy' })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <option value="balanced">Balanced</option>
            <option value="productivity">Productivity</option>
            <option value="dreamy">Dreamy</option>
          </select>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleResetAppearance} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">Reset appearance</button>
          <button onClick={handleResetDatabase} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 text-berry">Reset planner data</button>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <h2 className="font-serif text-3xl text-charcoal">Backup & restore</h2>
        <p className="mt-2 text-sm text-charcoal/70">Local browser storage is not a cloud backup and does not automatically sync across devices.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={handleExport} className="rounded-2xl bg-charcoal px-4 py-3 font-medium text-white">Export JSON</button>
          <button onClick={handleImport} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">Import JSON</button>
        </div>
        <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Paste a backup JSON file here to restore your data." className="mt-4 min-h-[160px] w-full rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
        {status && <p className="mt-3 text-sm text-charcoal/70">{status}</p>}
      </section>
    </div>
  )
}
