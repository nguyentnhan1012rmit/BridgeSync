import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  FileText,
  BookOpen,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'

const navItems = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'tasks', path: '/tasks', icon: ListChecks },
  { key: 'hourenso', path: '/hourenso', icon: FileText },
  { key: 'glossary', path: '/glossary', icon: BookOpen },
  { key: 'settings', path: '/settings', icon: Settings },
]

export default function MainLayout() {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-raised border-r border-border
          transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)]
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'w-64' : 'w-[72px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-lg text-text-primary whitespace-nowrap">
                BridgeSync
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-alt transition-colors cursor-pointer text-text-muted"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-[var(--duration-normal)] ${!sidebarOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-surface-alt rounded-md cursor-pointer text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
                group relative
                ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                  )}
                  <item.icon size={20} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm whitespace-nowrap">{t(`nav.${item.key}`)}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-xs font-bold">
                BS
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-text-primary truncate">BrSE User</p>
                <p className="text-xs text-text-muted truncate">bridge@company.jp</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-4 lg:px-8 bg-surface-raised border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 hover:bg-surface-alt rounded-lg cursor-pointer text-text-secondary"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <LanguageToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
