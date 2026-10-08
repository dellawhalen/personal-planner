import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import { PlannerProvider } from './context/planner-context'
const BudgetPage = lazy(() => import('./pages/BudgetPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const CountdownPage = lazy(() => import('./pages/CountdownPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const JournalPage = lazy(() => import('./pages/JournalPage'))
const MoodPage = lazy(() => import('./pages/MoodPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))

function App() {
  return (
    <PlannerProvider>
      <BrowserRouter>
        <Suspense fallback={<div role="status" className="p-6 font-dot text-sm text-charcoal/60">Opening your planner…</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/countdowns" element={<CountdownPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PlannerProvider>
  )
}

export default App
