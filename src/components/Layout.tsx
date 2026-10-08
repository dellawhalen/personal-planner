import { CalendarDays, Flower2, Heart, ListTodo, NotebookPen, Settings, Sparkles, Wallet, Clock3 } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { usePlanner } from '../context/planner-context'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Flower2 },
  { to: '/goals', label: 'Goals', icon: Sparkles },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/mood', label: 'Mood', icon: Heart },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/countdowns', label: 'Countdowns', icon: Clock3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const { preferences } = usePlanner()
  const siteName = preferences.siteName?.trim() || 'a life in bloom.'

  useEffect(() => {
    document.title = siteName
  }, [siteName])

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <div className="mx-auto flex max-w-[1600px] gap-6 p-4 md:p-6 xl:p-8">
        <aside className="dotted-frame hidden w-72 shrink-0 rounded-[22px] border border-[#e7d9d7] bg-white/85 p-5 shadow-bloom backdrop-blur-sm lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-[#ead8df] bg-[#f3e2ea] text-xl text-berry shadow-sm">
              <Flower2 className="h-5 w-5" />
              <span aria-hidden="true" className="absolute -right-1 -top-2 font-dot text-xs text-berry">♥</span>
            </div>
            <div>
              <p className="font-pixel text-2xl leading-tight text-charcoal">{siteName}</p>
              <p className="mt-1 font-dot text-[10px] uppercase text-berry/80">personal diary ✿</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'border-dotted border-[#d8b9c5] bg-[#f7e8ef] text-berry shadow-sm'
                      : 'text-charcoal/70 hover:bg-[#f9f4f1] hover:text-charcoal'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="w-full overflow-hidden rounded-[22px] border border-[#e7d9d7] bg-[#fffdfc] shadow-bloom">
          <div aria-hidden="true" className="flex h-8 items-center justify-between border-b border-dotted border-[#e7d9d7] bg-[#f8f2ef] px-4">
            <span className="retro-window-dots"><i /><i /><i /></span>
            <span className="font-dot text-[10px] uppercase text-charcoal/50">diary.exe</span>
          </div>
          <header className="flex items-center justify-between border-b border-[#f1e6df] px-5 py-4 md:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ead8df] bg-[#f3e2ea] text-berry">
                <Flower2 className="h-4 w-4" />
              </div>
              <p className="font-pixel text-xl leading-tight">{siteName}</p>
            </div>
            <div className="hidden font-dot text-xs uppercase text-charcoal/55 md:block">Personal sanctuary <span className="text-berry">✦</span></div>
            <span className="ml-auto hidden font-dot text-[10px] uppercase text-charcoal/45 sm:block">local mode · saved on this device</span>
          </header>

          <div className="p-5 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
