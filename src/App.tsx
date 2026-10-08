import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import { PlannerProvider } from './context/planner-context'
import BudgetPage from './pages/BudgetPage'
import CalendarPage from './pages/CalendarPage'
import CountdownPage from './pages/CountdownPage'
import DashboardPage from './pages/DashboardPage'
import GoalsPage from './pages/GoalsPage'
import JournalPage from './pages/JournalPage'
import MoodPage from './pages/MoodPage'
import SettingsPage from './pages/SettingsPage'
import TasksPage from './pages/TasksPage'

function App() {
  return (
    <PlannerProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </PlannerProvider>
  )
}

export default App
