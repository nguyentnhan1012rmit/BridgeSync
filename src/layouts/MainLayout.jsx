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
  LogOut,
} from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'
import { useAuth } from '@/hooks/useAuth'

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
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ animation: 'fadeIn 150ms ease' }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-surface-raised border-r border-border
          transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)]
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'w-64' : 'w-[72px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-lg text-text-primary whitespace-nowrap tracking-tight">
                BridgeSync
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-surface-alt transition-colors cursor-pointer text-text-muted"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-[var(--duration-normal)] ${!sidebarOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-surface-alt rounded-lg cursor-pointer text-text-muted"
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
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
                group relative no-underline
                ${
                  isActive
                    ? 'bg-primary/8 text-primary font-medium shadow-sm'
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
        <div className={`border-t border-border flex-shrink-0 ${sidebarOpen ? 'p-4' : 'p-3'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0 shadow-sm">
              {user?.name?.charAt(0) || 'BS'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-text-muted truncate">{user?.email || 'guest@bridgesync.com'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="topbar flex items-center justify-between h-16 px-4 lg:px-8 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 hover:bg-surface-alt rounded-lg cursor-pointer text-text-secondary transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="w-px h-6 bg-border" />
            <button
               onClick={logout}
               title="Log Out"
               className="p-2 text-text-muted hover:text-danger hover:bg-danger/8 rounded-lg transition-all duration-[var(--duration-fast)] cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-surface">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
